/**
 * Simple in-memory rate limiter.
 *
 * MVP scope: 3 generations per IP per UTC day, anonymous.
 * Limitations:
 *   - Resets on server restart.
 *   - Per-instance (single-instance deployments OK; horizontally scaled needs Redis).
 *
 * Production upgrade path: swap this module for Upstash Redis with the same API.
 */
const DAILY_LIMIT = 3;

type Bucket = { count: number; dayKey: string };
const store = new Map<string, Bucket>();

function todayUtcKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAtUtc: string; // ISO at next UTC midnight
}

function nextResetIso(): string {
  const d = new Date();
  const next = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0)
  );
  return next.toISOString();
}

export function checkAndConsume(ip: string): RateLimitResult {
  const dayKey = todayUtcKey();
  const existing = store.get(ip);
  const bucket: Bucket =
    existing && existing.dayKey === dayKey
      ? existing
      : { count: 0, dayKey };

  if (bucket.count >= DAILY_LIMIT) {
    store.set(ip, bucket);
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_LIMIT,
      resetAtUtc: nextResetIso(),
    };
  }

  bucket.count += 1;
  store.set(ip, bucket);
  return {
    allowed: true,
    remaining: DAILY_LIMIT - bucket.count,
    limit: DAILY_LIMIT,
    resetAtUtc: nextResetIso(),
  };
}

export function peek(ip: string): RateLimitResult {
  const dayKey = todayUtcKey();
  const existing = store.get(ip);
  const count =
    existing && existing.dayKey === dayKey ? existing.count : 0;
  return {
    allowed: count < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
    limit: DAILY_LIMIT,
    resetAtUtc: nextResetIso(),
  };
}

export const DAILY_LIMIT_VALUE = DAILY_LIMIT;
