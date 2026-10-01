import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COUNTER_KEY = "gagnants-229:public-visitors";
const INITIAL_COUNT = 50;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_VISITOR_INCREMENTS_PER_MINUTE = 12;
let developmentCount = INITIAL_COUNT;
const localRateLimits = new Map<string, { count: number; resetAt: number }>();

type RedisReply = { result?: number | string | null };

function configuredRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(command: string) {
  const connection = configuredRedis();
  if (!connection) return null;
  const response = await fetch(`${connection.url}/${command}`, {
    headers: { Authorization: `Bearer ${connection.token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Redis unavailable");
  return (await response.json()) as RedisReply;
}

function requestAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function canIncrement(request: NextRequest) {
  const address = requestAddress(request);
  const connection = configuredRedis();
  if (connection) {
    const key = encodeURIComponent(`gagnants-229:visitor-rate:${address}`);
    const reply = await redis(`incr/${key}`);
    const count = Number(reply?.result ?? 1);
    if (count === 1) await redis(`expire/${key}/${RATE_LIMIT_WINDOW_SECONDS}`);
    return count <= MAX_VISITOR_INCREMENTS_PER_MINUTE;
  }

  const now = Date.now();
  const current = localRateLimits.get(address);
  if (!current || current.resetAt <= now) {
    localRateLimits.set(address, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_VISITOR_INCREMENTS_PER_MINUTE;
}

async function getCount() {
  const connection = configuredRedis();
  if (!connection) {
    if (process.env.NODE_ENV === "production") throw new Error("Redis unavailable");
    return developmentCount;
  }
  const current = await redis(`get/${COUNTER_KEY}`);
  if (current?.result !== null && current?.result !== undefined) return Number(current.result);
  await redis(`setnx/${COUNTER_KEY}/${INITIAL_COUNT}`);
  const initialized = await redis(`get/${COUNTER_KEY}`);
  return Number(initialized?.result ?? INITIAL_COUNT);
}

export async function GET() {
  try {
    return NextResponse.json({ count: await getCount() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Compteur temporairement indisponible." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await canIncrement(request))) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } });
    }
    const connection = configuredRedis();
    if (!connection) {
      if (process.env.NODE_ENV === "production") throw new Error("Redis unavailable");
      developmentCount += 1;
      return NextResponse.json({ count: developmentCount }, { headers: { "Cache-Control": "no-store" } });
    }
    await redis(`setnx/${COUNTER_KEY}/${INITIAL_COUNT}`);
    const incremented = await redis(`incr/${COUNTER_KEY}`);
    return NextResponse.json({ count: Number(incremented?.result ?? INITIAL_COUNT) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Compteur temporairement indisponible." }, { status: 503 });
  }
}