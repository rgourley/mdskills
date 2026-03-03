/**
 * Simple in-memory rate limiter for API routes.
 *
 * This is per-process and resets on deploy / restart.
 * For production at scale, swap in Redis or Vercel KV.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60 000 = 1 minute) */
  windowMs?: number
  /** Max requests per window per key (default: 10) */
  max?: number
}

export function createRateLimiter(opts: RateLimiterOptions = {}) {
  const windowMs = opts.windowMs ?? 60_000
  const max = opts.max ?? 10
  const hits = new Map<string, RateLimitEntry>()

  // Clean stale entries every 5 minutes
  const cleanup = setInterval(() => {
    const now = Date.now()
    Array.from(hits.entries()).forEach(([key, entry]) => {
      if (now > entry.resetAt) hits.delete(key)
    })
  }, 300_000)
  cleanup.unref?.()

  return {
    /**
     * Check if a key has exceeded the rate limit.
     * Returns `true` if the request should be blocked.
     */
    check(key: string): boolean {
      const now = Date.now()
      const entry = hits.get(key)
      if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return false
      }
      entry.count++
      return entry.count > max
    },
  }
}

/** Extract a usable IP string from a Next.js request */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}
