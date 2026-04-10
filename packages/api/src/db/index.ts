import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import * as schema from './schema'

type D1Db = ReturnType<typeof drizzleD1<typeof schema>>
type SqliteDb = BetterSQLite3Database<typeof schema>
export type AppDb = SqliteDb | D1Db

// ── Per-request DB reference (set by middleware or startup) ──────────────────
let _db: AppDb | null = null

export function setDb(instance: AppDb) {
  _db = instance
}

/** Create a Drizzle instance from a Cloudflare D1 binding */
export function createD1Db(d1: D1Database) {
  return drizzleD1(d1, { schema })
}

/**
 * Proxy that delegates to the current DB instance.
 * Routes keep `import { db } from '../db'` — no changes needed.
 */
export const db: AppDb = new Proxy({} as AppDb, {
  get(_target, prop) {
    if (!_db) throw new Error('DB not initialized — ensure db middleware is registered')
    return (_db as any)[prop]
  },
})
