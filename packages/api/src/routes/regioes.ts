import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, count, eq, like, or, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { regioes } from '../db/schema'
import { ErrorSchema, listResponseSchema, PaginationQuery, SearchQuery } from '../schemas/shared'

const app = new OpenAPIHono()

const VALID_UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const

const RegiaoSchema = z
  .object({
    id: z.number(),
    codigoIbge: z.string().openapi({ example: '3550308' }),
    nome: z.string().openapi({ example: 'São Paulo' }),
    tipo: z.string().openapi({ example: 'municipio' }),
    uf: z.string().nullable().openapi({ example: 'SP' }),
    estado: z.string().nullable().openapi({ example: 'São Paulo' }),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  })
  .openapi('Regiao')

const selectFields = {
  id: regioes.id,
  codigoIbge: regioes.codigoIbge,
  nome: regioes.nome,
  tipo: regioes.tipo,
  uf: regioes.uf,
  estado: regioes.estado,
  latitude: regioes.latitude,
  longitude: regioes.longitude,
}

// ── LIST ──────────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Regiões (IBGE)'],
    summary: 'List regions with filtering',
    request: {
      query: PaginationQuery.extend({
        q: z.string().optional().openapi({ description: 'Search by nome or codigo_ibge' }),
        uf: z.string().length(2).optional().openapi({ description: 'State code (e.g. SP, RJ)' }),
        tipo: z
          .enum(['municipio', 'estado', 'pais'])
          .optional()
          .openapi({ description: 'Region type' }),
      }),
    },
    responses: {
      200: {
        description: 'Paginated list of regions',
        content: { 'application/json': { schema: listResponseSchema(RegiaoSchema) } },
      },
      422: {
        description: 'Invalid UF',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { q, uf, tipo, limit, offset } = c.req.valid('query')

    if (uf && !VALID_UFS.includes(uf.toUpperCase() as (typeof VALID_UFS)[number])) {
      return c.json(
        { error: { code: 'INVALID_PARAMETER', message: `UF inválida: ${uf}`, status: 422 } },
        422,
      )
    }

    const conditions: SQL[] = []
    if (q) {
      conditions.push(or(like(regioes.nome, `%${q}%`), like(regioes.codigoIbge, `%${q}%`))!)
    }
    if (uf) conditions.push(eq(regioes.uf, uf.toUpperCase()))
    if (tipo) conditions.push(eq(regioes.tipo, tipo))
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [data, [{ total }]] = await Promise.all([
      db.select(selectFields).from(regioes).where(where).limit(limit).offset(offset),
      db.select({ total: count() }).from(regioes).where(where),
    ])

    return c.json({ data, meta: { total, limit, offset } }, 200 as const)
  },
)

// ── GET BY IBGE CODE ──────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/ibge/{codigo}',
    tags: ['Regiões (IBGE)'],
    summary: 'Get region by IBGE code',
    request: {
      params: z.object({ codigo: z.string().openapi({ example: '3550308' }) }),
    },
    responses: {
      200: {
        description: 'Region found',
        content: { 'application/json': { schema: z.object({ data: RegiaoSchema }) } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { codigo } = c.req.valid('param')
    const [row] = await db.select(selectFields).from(regioes).where(eq(regioes.codigoIbge, codigo))

    if (!row)
      return c.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Código IBGE '${codigo}' não encontrado`,
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
    tags: ['Regiões (IBGE)'],
    summary: 'Autocomplete for regions (lightweight)',
    request: {
      query: SearchQuery.extend({
        uf: z.string().length(2).optional(),
        tipo: z.enum(['municipio', 'estado', 'pais']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Autocomplete results',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(
                z.object({
                  codigoIbge: z.string(),
                  nome: z.string(),
                  tipo: z.string(),
                  uf: z.string().nullable(),
                }),
              ),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { q, limit, uf, tipo } = c.req.valid('query')
    if (!q) return c.json({ data: [] })

    const conditions: SQL[] = [
      or(like(regioes.nome, `%${q}%`), like(regioes.codigoIbge, `%${q}%`))!,
    ]
    if (uf) conditions.push(eq(regioes.uf, uf.toUpperCase()))
    if (tipo) conditions.push(eq(regioes.tipo, tipo))

    const data = await db
      .select({
        codigoIbge: regioes.codigoIbge,
        nome: regioes.nome,
        tipo: regioes.tipo,
        uf: regioes.uf,
      })
      .from(regioes)
      .where(and(...conditions))
      .limit(limit)

    return c.json({ data })
  },
)

// ── ESTADOS ───────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/estados',
    tags: ['Regiões (IBGE)'],
    summary: 'List all states',
    responses: {
      200: {
        description: 'List of states',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(
                z.object({
                  codigoIbge: z.string(),
                  nome: z.string(),
                  uf: z.string().nullable(),
                }),
              ),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const data = await db
      .select({ codigoIbge: regioes.codigoIbge, nome: regioes.nome, uf: regioes.uf })
      .from(regioes)
      .where(eq(regioes.tipo, 'estado'))
      .orderBy(regioes.nome)

    return c.json({ data })
  },
)

// ── MUNICIPIOS POR ESTADO ─────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/estados/{uf}/municipios',
    tags: ['Regiões (IBGE)'],
    summary: 'List cities for a state',
    request: {
      params: z.object({ uf: z.string().length(2).openapi({ example: 'SP' }) }),
      query: PaginationQuery.extend({
        q: z.string().optional().openapi({ description: 'Search by city name' }),
      }),
    },
    responses: {
      200: {
        description: 'List of cities',
        content: { 'application/json': { schema: listResponseSchema(RegiaoSchema) } },
      },
      422: {
        description: 'Invalid UF',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { uf } = c.req.valid('param')
    const { q, limit, offset } = c.req.valid('query')

    if (!VALID_UFS.includes(uf.toUpperCase() as (typeof VALID_UFS)[number])) {
      return c.json(
        { error: { code: 'INVALID_PARAMETER', message: `UF inválida: ${uf}`, status: 422 } },
        422,
      )
    }

    const conditions: SQL[] = [eq(regioes.uf, uf.toUpperCase()), eq(regioes.tipo, 'municipio')]
    if (q) conditions.push(like(regioes.nome, `%${q}%`))
    const where = and(...conditions)

    const [data, [{ total }]] = await Promise.all([
      db
        .select(selectFields)
        .from(regioes)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(regioes.nome),
      db.select({ total: count() }).from(regioes).where(where),
    ])

    return c.json({ data, meta: { total, limit, offset } }, 200 as const)
  },
)

// ── GET BY ID (must be last) ──────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Regiões (IBGE)'],
    summary: 'Get region by ID',
    request: {
      params: z.object({ id: z.coerce.number().openapi({ example: 1 }) }),
    },
    responses: {
      200: {
        description: 'Region found',
        content: { 'application/json': { schema: z.object({ data: RegiaoSchema }) } },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const [row] = await db.select(selectFields).from(regioes).where(eq(regioes.id, id))

    if (!row)
      return c.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Região não encontrada', status: 404 } },
        404,
      )
    return c.json({ data: row }, 200 as const)
  },
)

export default app
