import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  identifier: string;
  window?: `${number} m`;
};

type LocalLimit = { count: number; resetAt: number };

const localLimits = new Map<string, LocalLimit>();
const limiters = new Map<string, Ratelimit>();
let redisClient: Redis | null = null;

function getRateLimiter(limit: number, window: `${number} m`) {
  const cacheKey = `${limit}:${window}`;
  const cached = limiters.get(cacheKey);
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redisClient ??= new Redis({ url, token });
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: "gagnants-229:api-rate-limit",
    analytics: false,
  });
  limiters.set(cacheKey, limiter);
  return limiter;
}

function getRequestAddress(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",").at(-1)?.trim() || "unknown";
  return process.env.NODE_ENV === "development" ? "local-development" : "unknown";
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function tooManyRequests(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) } },
  );
}

export async function enforceRateLimit(request: NextRequest, options: RateLimitOptions) {
  const window = options.window ?? "1 m";
  const identifier = hashIdentifier(`${options.key}:${options.identifier}`);
  const limiter = getRateLimiter(options.limit, window);

  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      if (result.reason === "timeout") {
        console.error("La limitation de débit a expiré faute de réponse d’Upstash.");
        return NextResponse.json(
          { error: "La protection temporaire est indisponible. Réessayez dans quelques instants." },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
      return result.success ? null : tooManyRequests(result.reset);
    } catch (cause) {
      console.error("Le service de limitation de débit est indisponible.", cause);
      return NextResponse.json(
        { error: "La protection temporaire est indisponible. Réessayez dans quelques instants." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    console.error("La limitation de débit requiert UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN en production.");
    return NextResponse.json(
      { error: "La protection temporaire est indisponible. Réessayez dans quelques instants." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const now = Date.now();
  for (const [key, value] of localLimits) {
    if (value.resetAt <= now) localLimits.delete(key);
  }

  const localKey = `${options.key}:${getRequestAddress(request)}:${identifier}`;
  const current = localLimits.get(localKey);
  if (!current || current.resetAt <= now) {
    localLimits.set(localKey, { count: 1, resetAt: now + Number.parseInt(window, 10) * 60_000 });
    return null;
  }
  if (current.count >= options.limit) return tooManyRequests(current.resetAt);
  current.count += 1;
  return null;
}

export function requestRateLimitIdentifier(request: NextRequest) {
  return getRequestAddress(request);
}
