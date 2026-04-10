import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { count, eq, like, or, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { sintomas } from '../db/schema'
import { ErrorSchema, listResponseSchema, PaginationQuery, SearchQuery } from '../schemas/shared'

const app = new OpenAPIHono()

const SintomaSchema = z
  .object({
    id: z.number(),
    codigo: z.string().openapi({ example: 'R00' }),
    nome: z.string().openapi({ example: 'Anormalidades do batimento cardíaco' }),
    descricao: z.string().nullable(),
  })
  .openapi('Sintoma')

const selectFields = {
  id: sintomas.id,
  codigo: sintomas.codigo,
  nome: sintomas.nome,
  descricao: sintomas.descricao,
}

// ── LIST ──────────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Sintomas (CID-10)'],
    summary: 'List symptoms with search',
    request: {
      query: PaginationQuery.extend({
        q: z.string().optional().openapi({ description: 'Search by nome or codigo' }),
      }),
    },
    responses: {
      200: {
        description: 'Paginated list of symptoms',
        content: { 'application/json': { schema: listResponseSchema(SintomaSchema) } },
      },
    },
  }),
  async (c) => {
    const { q, limit, offset } = c.req.valid('query')

    const where: SQL | undefined = q
      ? or(like(sintomas.nome, `%${q}%`), like(sintomas.codigo, `%${q}%`))
      : undefined

    const [data, [{ total }]] = await Promise.all([
      db.select(selectFields).from(sintomas).where(where).limit(limit).offset(offset),
      db.select({ total: count() }).from(sintomas).where(where),
    ])

    return c.json({ data, meta: { total, limit, offset } })
  },
)

// ── GET BY CODE ───────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/codigo/{codigo}',
    tags: ['Sintomas (CID-10)'],
    summary: 'Get symptom by CID-10 code',
    request: {
      params: z.object({ codigo: z.string().openapi({ example: 'R00' }) }),
    },
    responses: {
      200: {
        description: 'Symptom found',
        content: { 'application/json': { schema: z.object({ data: SintomaSchema }) } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { codigo } = c.req.valid('param')
    const [row] = await db
      .select(selectFields)
      .from(sintomas)
      .where(eq(sintomas.codigo, codigo.toUpperCase()))

    if (!row)
      return c.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Código '${codigo}' não encontrado`,
            status: 404,
          },
        },
        404,
      )
    return c.json({ data: row }, 200 as const)
  },
)

// ── AUTOCOMPLETE ──────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/autocomplete',
    tags: ['Sintomas (CID-10)'],
    summary: 'Autocomplete for symptoms (lightweight)',
    request: { query: SearchQuery },
    responses: {
      200: {
        description: 'Autocomplete results',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(z.object({ codigo: z.string(), nome: z.string() })),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { q, limit } = c.req.valid('query')
    if (!q) return c.json({ data: [] })

    const data = await db
      .select({ codigo: sintomas.codigo, nome: sintomas.nome })
      .from(sintomas)
      .where(or(like(sintomas.nome, `%${q}%`), like(sintomas.codigo, `%${q}%`)))
      .limit(limit)

    return c.json({ data })
  },
)

// ── GET BY ID (must be last) ──────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Sintomas (CID-10)'],
    summary: 'Get symptom by ID',
    request: {
      params: z.object({ id: z.coerce.number().openapi({ example: 1 }) }),
    },
    responses: {
      200: {
        description: 'Symptom found',
        content: { 'application/json': { schema: z.object({ data: SintomaSchema }) } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const [row] = await db.select(selectFields).from(sintomas).where(eq(sintomas.id, id))

    if (!row)
      return c.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Sintoma não encontrado', status: 404 } },
        404,
      )
    return c.json({ data: row }, 200 as const)
  },
)

export default app
