import Database from 'better-sqlite3'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function createTestDb() {
  const sqlite = new Database(':memory:')
  const testDb = drizzle(sqlite, { schema })

  testDb.run(sql`
    CREATE TABLE doencas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      capitulo TEXT,
      categoria TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  testDb.run(sql`CREATE UNIQUE INDEX doencas_codigo_unique ON doencas(codigo)`)
  testDb.run(sql`CREATE INDEX idx_doencas_codigo ON doencas(codigo)`)

  testDb.run(sql`
    CREATE TABLE sintomas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  testDb.run(sql`CREATE UNIQUE INDEX sintomas_codigo_unique ON sintomas(codigo)`)
  testDb.run(sql`CREATE INDEX idx_sintomas_codigo ON sintomas(codigo)`)

  testDb.run(sql`
    CREATE TABLE regioes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_ibge TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      uf TEXT,
      estado TEXT,
      latitude REAL,
      longitude REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  testDb.run(sql`CREATE UNIQUE INDEX regioes_codigo_ibge_unique ON regioes(codigo_ibge)`)
  testDb.run(sql`CREATE INDEX idx_regioes_codigo_ibge ON regioes(codigo_ibge)`)
  testDb.run(sql`CREATE INDEX idx_regioes_uf ON regioes(uf)`)

  return testDb
}
