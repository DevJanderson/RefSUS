import type { MiddlewareHandler } from 'hono'
import { createD1Db, setDb } from '../db'
import type { AppEnv } from '../types'

/**
 * Middleware that initializes the database per request.
 * - Cloudflare Workers: uses D1 binding from env
 * - Node.js: db is already set at startup (index.ts), this is a no-op
 */
export const dbMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const d1 = c.env?.DB
  if (d1) {
    setDb(createD1Db(d1))
  }
  await next()
}
