import { NextResponse } from 'next/server'

const tokenBuckets = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: { interval: number; limit: number }) {
  return {
    check(key: string): { success: boolean; remaining: number } {
      const now = Date.now()
      const bucket = tokenBuckets.get(key)

      if (!bucket || now > bucket.resetTime) {
        tokenBuckets.set(key, { count: 1, resetTime: now + options.interval })
        return { success: true, remaining: options.limit - 1 }
      }

      if (bucket.count >= options.limit) {
        return { success: false, remaining: 0 }
      }

      bucket.count++
      return { success: true, remaining: options.limit - bucket.count }
    },
  }
}

const isDev = process.env.NODE_ENV !== 'production'
export const aiLimiter = rateLimit({ interval: 60_000, limit: isDev ? 1000 : 10 })
export const authLimiter = rateLimit({ interval: 60_000, limit: isDev ? 1000 : 5 })
export const formLimiter = rateLimit({ interval: 60_000, limit: isDev ? 1000 : 10 })
export const apiLimiter = rateLimit({ interval: 60_000, limit: isDev ? 1000 : 30 })

export function rateLimitResponse() {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  )
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of Array.from(tokenBuckets)) {
      if (now > bucket.resetTime) tokenBuckets.delete(key)
    }
  }, 300_000)
}
