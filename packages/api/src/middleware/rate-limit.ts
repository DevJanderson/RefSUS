import { rateLimiter } from 'hono-rate-limiter'

export const apiRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
  message: { error: 'Too many requests, try again later' },
})
