/**
 * Generates a SQL file to seed the D1 database from CSV/JSON data files.
 * Usage: npx tsx scripts/generate-seed-sql.ts > scripts/seed.sql
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'

function loadCsv<T>(path: string): T[] {
  const content = readFileSync(path, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true }) as T[]
}

function escapeSql(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'NULL'
  return `'${value.replace(/'/g, "''")}'`
}

const now = new Date().toISOString()
const lines: string[] = []

// ── Doencas ──────────────────────────────────────────────────────────────────
const doencas = loadCsv<{ codigo: string; nome: string; capitulo: string; categoria: string }>('data/doencas.csv')
for (const r of doencas) {
  lines.push(
    `INSERT INTO doencas (codigo, nome, capitulo, categoria, created_at, updated_at) VALUES (${escapeSql(r.codigo)}, ${escapeSql(r.nome)}, ${escapeSql(r.capitulo)}, ${escapeSql(r.categoria)}, ${escapeSql(now)}, ${escapeSql(now)});`,
  )
}

// ── Sintomas ─────────────────────────────────────────────────────────────────
const sintomas = loadCsv<{ codigo: string; nome: string }>('data/sintomas.csv')
for (const r of sintomas) {
  lines.push(
    `INSERT INTO sintomas (codigo, nome, created_at, updated_at) VALUES (${escapeSql(r.codigo)}, ${escapeSql(r.nome)}, ${escapeSql(now)}, ${escapeSql(now)});`,
  )
}

// ── Regioes ──────────────────────────────────────────────────────────────────
const regioes = loadCsv<{ codigo_ibge: string; nome: string; tipo: string; uf: string; estado: string }>('data/regioes.csv')
for (const r of regioes) {
  lines.push(
    `INSERT INTO regioes (codigo_ibge, nome, tipo, uf, estado, created_at, updated_at) VALUES (${escapeSql(r.codigo_ibge)}, ${escapeSql(r.nome)}, ${escapeSql(r.tipo)}, ${escapeSql(r.uf)}, ${escapeSql(r.estado)}, ${escapeSql(now)}, ${escapeSql(now)});`,
  )
}

// ── Notificacao Compulsoria ──────────────────────────────────────────────────
const notificacoes = loadCsv<{ agravo: string; codigos_cid10: string; tipo_notificacao: string }>('data/notificacao_compulsoria.csv')
let ncId = 1
for (const r of notificacoes) {
  lines.push(
    `INSERT INTO notificacao_compulsoria (id, agravo, tipo_notificacao, created_at) VALUES (${ncId}, ${escapeSql(r.agravo)}, ${escapeSql(r.tipo_notificacao)}, ${escapeSql(now)});`,
  )
  const codigos = r.codigos_cid10.split(';').map((c) => c.trim())
  for (const codigo of codigos) {
    lines.push(
      `INSERT INTO notificacao_cid (notificacao_id, codigo_cid) VALUES (${ncId}, ${escapeSql(codigo)});`,
    )
  }
  ncId++
}

const output = lines.join('\n')
writeFileSync('scripts/seed.sql', output)
console.log(`Generated scripts/seed.sql with ${lines.length} statements`)
