import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { count, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { doencas, regioes, sintomas } from '../db/schema'

const app = new OpenAPIHono()

// ── OVERVIEW ──────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Estatísticas'],
    summary: 'Dataset overview',
    responses: {
      200: {
        description: 'General statistics',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                doencas: z.number(),
                sintomas: z.number(),
                regioes: z.object({
                  total: z.number(),
                  estados: z.number(),
                  municipios: z.number(),
                }),
              }),
              version: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const [[d], [s], [rTotal], [rEstados], [rMunicipios]] = await Promise.all([
      db.select({ total: count() }).from(doencas),
      db.select({ total: count() }).from(sintomas),
      db.select({ total: count() }).from(regioes),
      db.select({ total: count() }).from(regioes).where(eq(regioes.tipo, 'estado')),
      db.select({ total: count() }).from(regioes).where(eq(regioes.tipo, 'municipio')),
    ])

    return c.json({
      data: {
        doencas: d.total,
        sintomas: s.total,
        regioes: {
          total: rTotal.total,
          estados: rEstados.total,
          municipios: rMunicipios.total,
        },
      },
      version: '1.0.0',
    })
  },
)

// ── DOENÇAS POR CAPITULO ──────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/doencas',
    tags: ['Estatísticas'],
    summary: 'Disease statistics by chapter',
    responses: {
      200: {
        description: 'Disease distribution',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                total: z.number(),
                porCapitulo: z.array(
                  z.object({
                    capitulo: z.string(),
                    total: z.number(),
                    percentual: z.number(),
                  }),
                ),
              }),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const rows = await db
      .select({
        capitulo: doencas.capitulo,
        total: count(),
      })
      .from(doencas)
      .groupBy(doencas.capitulo)
      .orderBy(sql`count(*) DESC`)

    const totalGeral = rows.reduce((acc, r) => acc + r.total, 0)

    return c.json({
      data: {
        total: totalGeral,
        porCapitulo: rows
          .filter((r) => r.capitulo !== null)
          .map((r) => ({
            capitulo: r.capitulo as string,
            total: r.total,
            percentual: Math.round((r.total / totalGeral) * 10000) / 100,
          })),
      },
    })
  },
)

// ── REGIÕES POR ESTADO ────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/regioes',
    tags: ['Estatísticas'],
    summary: 'Region statistics by state',
    responses: {
      200: {
        description: 'Municipality distribution by state',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                totalMunicipios: z.number(),
                porEstado: z.array(
                  z.object({
                    uf: z.string(),
                    estado: z.string(),
                    municipios: z.number(),
                  }),
                ),
                maiorEstado: z.object({ uf: z.string(), municipios: z.number() }),
                menorEstado: z.object({ uf: z.string(), municipios: z.number() }),
              }),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const rows = await db
      .select({
        uf: regioes.uf,
        estado: regioes.estado,
        municipios: count(),
      })
      .from(regioes)
      .where(eq(regioes.tipo, 'municipio'))
      .groupBy(regioes.uf, regioes.estado)
      .orderBy(sql`count(*) DESC`)

    const filtered = rows.filter((r) => r.uf !== null && r.estado !== null)
    const totalMunicipios = filtered.reduce((acc, r) => acc + r.municipios, 0)
    const primeiro = filtered[0]
    const ultimo = filtered[filtered.length - 1]

    return c.json({
      data: {
        totalMunicipios,
        porEstado: filtered.map((r) => ({
          uf: r.uf as string,
          estado: r.estado as string,
          municipios: r.municipios,
        })),
        maiorEstado: { uf: primeiro.uf as string, municipios: primeiro.municipios },
        menorEstado: { uf: ultimo.uf as string, municipios: ultimo.municipios },
      },
    })
  },
)

export default app
