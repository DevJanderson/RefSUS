import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'
import { count } from 'drizzle-orm'
import { db } from '../db'
import { doencas, notificacaoCid, notificacaoCompulsoria, regioes, sintomas } from '../db/schema'

function loadCsv<T>(path: string): T[] {
  const content = readFileSync(path, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true }) as T[]
}

export async function seed() {
  const [{ total: totalDoencas }] = await db.select({ total: count() }).from(doencas)
  if (totalDoencas === 0) {
    const rows = loadCsv<{ codigo: string; nome: string; capitulo: string; categoria: string }>(
      'data/doencas.csv',
    )
    const batch = rows.map((r) => ({
      codigo: r.codigo,
      nome: r.nome,
      capitulo: r.capitulo || null,
      categoria: r.categoria || null,
    }))
    for (let i = 0; i < batch.length; i += 500) {
      await db.insert(doencas).values(batch.slice(i, i + 500))
    }
    console.log(`[seed] ${batch.length} doencas loaded`)
  }

  const [{ total: totalSintomas }] = await db.select({ total: count() }).from(sintomas)
  if (totalSintomas === 0) {
    const rows = loadCsv<{ codigo: string; nome: string }>('data/sintomas.csv')
    const batch = rows.map((r) => ({ codigo: r.codigo, nome: r.nome }))
    for (let i = 0; i < batch.length; i += 500) {
      await db.insert(sintomas).values(batch.slice(i, i + 500))
    }
    console.log(`[seed] ${batch.length} sintomas loaded`)
  }

  const [{ total: totalRegioes }] = await db.select({ total: count() }).from(regioes)
  if (totalRegioes === 0) {
    const rows = loadCsv<{
      codigo_ibge: string
      nome: string
      tipo: string
      uf: string
      estado: string
    }>('data/regioes.csv')
    const batch = rows.map((r) => ({
      codigoIbge: r.codigo_ibge,
      nome: r.nome,
      tipo: r.tipo,
      uf: r.uf || null,
      estado: r.estado || null,
    }))
    for (let i = 0; i < batch.length; i += 500) {
      await db.insert(regioes).values(batch.slice(i, i + 500))
    }
    console.log(`[seed] ${batch.length} regioes loaded`)
  }

  const [{ total: totalNC }] = await db.select({ total: count() }).from(notificacaoCompulsoria)
  if (totalNC === 0) {
    const rows = loadCsv<{
      agravo: string
      codigos_cid10: string
      tipo_notificacao: string
    }>('data/notificacao_compulsoria.csv')

    for (const row of rows) {
      const [inserted] = await db
        .insert(notificacaoCompulsoria)
        .values({
          agravo: row.agravo,
          tipoNotificacao: row.tipo_notificacao,
        })
        .returning()

      const codigos = row.codigos_cid10.split(';').map((c) => c.trim())
      for (const codigo of codigos) {
        await db.insert(notificacaoCid).values({
          notificacaoId: inserted.id,
          codigoCid: codigo,
        })
      }
    }
    console.log(`[seed] ${rows.length} agravos de notificação compulsória loaded`)
  }
}
