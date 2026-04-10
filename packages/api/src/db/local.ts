import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

/**
 * Create a Drizzle instance from a local SQLite file.
 * Node.js only — do not import this from Worker code.
 */
export function createLocalDb(dbPath: string) {
  mkdirSync(dirname(dbPath), { recursive: true })

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: 'drizzle' })

  return db
}

let _localDb: ReturnType<typeof createLocalDb> | null = null

export function getLocalDb(dbPath = 'data/referencia.db') {
  if (!_localDb) {
    _localDb = createLocalDb(dbPath)
  }
  return _localDb
}
