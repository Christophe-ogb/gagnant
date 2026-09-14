import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COUNTER_KEY = "gagnants-229:public-visitors";
const INITIAL_COUNT = 50;
let developmentCount = INITIAL_COUNT;

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
  if (!response.ok) throw new Error("Impossible de lire le compteur Redis.");
  return (await response.json()) as RedisReply;
}

async function getCount() {
  const connection = configuredRedis();
  if (!connection) {
    if (process.env.NODE_ENV === "production") throw new Error("Redis n’est pas configuré.");
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

export async function POST() {
  try {
    const connection = configuredRedis();
    if (!connection) {
      if (process.env.NODE_ENV === "production") throw new Error("Redis n’est pas configuré.");
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
