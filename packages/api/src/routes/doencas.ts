import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, count, eq, like, or, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { doencas } from '../db/schema'
import { ErrorSchema, listResponseSchema, PaginationQuery, SearchQuery } from '../schemas/shared'

const app = new OpenAPIHono()

const DoencaSchema = z
  .object({
    id: z.number(),
    codigo: z.string().openapi({ example: 'A00' }),
    nome: z.string().openapi({ example: 'Cólera' }),
    descricao: z.string().nullable(),
    capitulo: z
      .string()
      .nullable()
      .openapi({ example: 'I - Algumas doenças infecciosas e parasitárias' }),
    categoria: z
      .string()
      .nullable()
      .openapi({ example: 'A00-A09 Doenças infecciosas intestinais' }),
  })
  .openapi('Doenca')

const selectFields = {
  id: doencas.id,
  codigo: doencas.codigo,
  nome: doencas.nome,
  descricao: doencas.descricao,
  capitulo: doencas.capitulo,
  categoria: doencas.categoria,
}

// ── LIST ──────────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Doenças (CID-10)'],
    summary: 'List diseases with search and filtering',
    request: {
      query: PaginationQuery.extend({
        q: z.string().optional().openapi({ description: 'Search by nome or codigo' }),
        capitulo: z.string().optional().openapi({ description: 'Filter by ICD-10 chapter' }),
        categoria: z.string().optional().openapi({ description: 'Filter by category' }),
      }),
    },
    responses: {
      200: {
        description: 'Paginated list of diseases',
        content: { 'application/json': { schema: listResponseSchema(DoencaSchema) } },
      },
    },
  }),
  async (c) => {
    const { q, capitulo, categoria, limit, offset } = c.req.valid('query')

    const conditions: SQL[] = []
    if (q) {
      conditions.push(or(like(doencas.nome, `%${q}%`), like(doencas.codigo, `%${q}%`))!)
    }
    if (capitulo) conditions.push(eq(doencas.capitulo, capitulo))
    if (categoria) conditions.push(eq(doencas.categoria, categoria))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [data, [{ total }]] = await Promise.all([
      db.select(selectFields).from(doencas).where(where).limit(limit).offset(offset),
      db.select({ total: count() }).from(doencas).where(where),
    ])

    return c.json({ data, meta: { total, limit, offset } })
  },
)

// ── GET BY CODE ───────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/codigo/{codigo}',
    tags: ['Doenças (CID-10)'],
    summary: 'Get disease by CID-10 code',
    request: {
      params: z.object({ codigo: z.string().openapi({ example: 'A00' }) }),
    },
    responses: {
      200: {
        description: 'Disease found',
        content: { 'application/json': { schema: z.object({ data: DoencaSchema }) } },
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
      .from(doencas)
      .where(eq(doencas.codigo, codigo.toUpperCase()))

    if (!row)
      return c.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Código CID-10 '${codigo}' não encontrado`,
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
    tags: ['Doenças (CID-10)'],
    summary: 'Autocomplete for diseases (lightweight)',
    request: { query: SearchQuery },
    responses: {
      200: {
        description: 'Autocomplete results',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(
                z.object({
                  codigo: z.string(),
                  nome: z.string(),
                }),
              ),
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
      .select({ codigo: doencas.codigo, nome: doencas.nome })
      .from(doencas)
      .where(or(like(doencas.nome, `%${q}%`), like(doencas.codigo, `%${q}%`)))
      .limit(limit)

    return c.json({ data })
  },
)

// ── FACETS: CAPITULOS ─────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/capitulos',
    tags: ['Doenças (CID-10)'],
    summary: 'List available ICD-10 chapters',
    responses: {
      200: {
        description: 'List of chapters',
        content: {
          'application/json': {
            schema: z.object({ data: z.array(z.string()) }),
          },
        },
      },
    },
  }),
  async (c) => {
    const rows = await db
      .selectDistinct({ capitulo: doencas.capitulo })
      .from(doencas)
      .orderBy(doencas.capitulo)

    return c.json({ data: rows.map((r) => r.capitulo).filter((v): v is string => v !== null) })
  },
)

// ── FACETS: CATEGORIAS ────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/categorias',
    tags: ['Doenças (CID-10)'],
    summary: 'List available ICD-10 categories',
    request: {
      query: z.object({
        capitulo: z.string().optional().openapi({ description: 'Filter categories by chapter' }),
      }),
    },
    responses: {
      200: {
        description: 'List of categories',
        content: {
          'application/json': {
            schema: z.object({ data: z.array(z.string()) }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { capitulo } = c.req.valid('query')
    const where = capitulo ? eq(doencas.capitulo, capitulo) : undefined

    const rows = await db
      .selectDistinct({ categoria: doencas.categoria })
      .from(doencas)
      .where(where)
      .orderBy(doencas.categoria)

    return c.json({ data: rows.map((r) => r.categoria).filter((v): v is string => v !== null) })
  },
)

// ── GET BY ID (must be last — /{id} is a catch-all param) ─────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Doenças (CID-10)'],
    summary: 'Get disease by ID',
    request: {
      params: z.object({ id: z.coerce.number().openapi({ example: 1 }) }),
    },
    responses: {
      200: {
        description: 'Disease found',
        content: { 'application/json': { schema: z.object({ data: DoencaSchema }) } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const [row] = await db.select(selectFields).from(doencas).where(eq(doencas.id, id))

    if (!row)
      return c.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Doença não encontrada', status: 404 } },
        404,
      )
    return c.json({ data: row }, 200 as const)
  },
)

export default app
