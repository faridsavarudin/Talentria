/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-process deployments (local dev / single Vercel instance).
 * For multi-region production, replace with Upstash Redis.
 */

interface Window {
  tokens: number[];  // timestamps of requests in this window
}

const store = new Map<string, Window>();

/** Cleans up expired entries periodically */
let lastCleanup = Date.now();
function maybeCleanup(windowMs: number) {
  if (Date.now() - lastCleanup > windowMs * 2) {
    lastCleanup = Date.now();
    const cutoff = Date.now() - windowMs;
    for (const [key, w] of store) {
      w.tokens = w.tokens.filter((t) => t > cutoff);
      if (w.tokens.length === 0) store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and record a rate-limited request.
 * @param key        Unique identifier (e.g. IP address, user ID)
 * @param limit      Max requests allowed in the window
 * @param windowMs   Window size in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybeCleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  if (!store.has(key)) store.set(key, { tokens: [] });
  const w = store.get(key)!;

  // Remove expired timestamps
  w.tokens = w.tokens.filter((t) => t > cutoff);

  if (w.tokens.length >= limit) {
    const oldest = w.tokens[0];
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(oldest + windowMs),
    };
  }

  w.tokens.push(now);
  return {
    success: true,
    remaining: limit - w.tokens.length,
    resetAt: new Date(now + windowMs),
  };
}

/** Helper to get the client IP from a Next.js Request */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
