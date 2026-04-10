import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, eq, like, type SQL } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { regioes } from '../src/db/schema'
import { createTestDb } from '../src/db/test-db'

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

function seedRegioes(db: ReturnType<typeof createTestDb>) {
  const data = [
    { codigoIbge: '35', nome: 'São Paulo', tipo: 'estado', uf: 'SP', estado: 'São Paulo' },
    { codigoIbge: '3550308', nome: 'São Paulo', tipo: 'municipio', uf: 'SP', estado: 'São Paulo' },
    {
      codigoIbge: '3304557',
      nome: 'Rio de Janeiro',
      tipo: 'municipio',
      uf: 'RJ',
      estado: 'Rio de Janeiro',
    },
    {
      codigoIbge: '33',
      nome: 'Rio de Janeiro',
      tipo: 'estado',
      uf: 'RJ',
      estado: 'Rio de Janeiro',
    },
    { codigoIbge: '12', nome: 'Acre', tipo: 'estado', uf: 'AC', estado: 'Acre' },
  ]
  for (const d of data) {
    db.insert(regioes).values(d).run()
  }
}

function createApp() {
  const db = createTestDb()
  seedRegioes(db)
  const app = new OpenAPIHono()

  app.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: {
        200: {
          description: 'List',
          content: { 'application/json': { schema: z.array(z.any()) } },
        },
        422: {
          description: 'Invalid UF',
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
      },
      request: {
        query: z.object({
          search: z.string().optional(),
          uf: z.string().length(2).optional(),
          tipo: z.enum(['municipio', 'estado', 'pais']).optional(),
          limit: z.coerce.number().int().min(1).max(100).default(100),
          offset: z.coerce.number().int().min(0).default(0),
        }),
      },
    }),
    async (c) => {
      const { search, uf, tipo, limit, offset } = c.req.valid('query')

      if (uf && !VALID_UFS.includes(uf.toUpperCase() as (typeof VALID_UFS)[number])) {
        return c.json({ error: `UF inválida: ${uf}` }, 422)
      }

      const conditions: SQL[] = []
      if (search) conditions.push(like(regioes.nome, `%${search}%`))
      if (uf) conditions.push(eq(regioes.uf, uf.toUpperCase()))
      if (tipo) conditions.push(eq(regioes.tipo, tipo))
      const where = conditions.length > 0 ? and(...conditions) : undefined

      const data = await db
        .select({
          id: regioes.id,
          codigoIbge: regioes.codigoIbge,
          nome: regioes.nome,
          tipo: regioes.tipo,
          uf: regioes.uf,
          estado: regioes.estado,
          latitude: regioes.latitude,
          longitude: regioes.longitude,
        })
        .from(regioes)
        .where(where)
        .limit(limit)
        .offset(offset)

      return c.json(data)
    },
  )

  app.openapi(
    createRoute({
      method: 'get',
      path: '/{id}',
      responses: {
        200: {
          description: 'Found',
          content: { 'application/json': { schema: z.any() } },
        },
        404: {
          description: 'Not found',
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
      },
      request: {
        params: z.object({ id: z.coerce.number() }),
      },
    }),
    async (c) => {
      const { id } = c.req.valid('param')
      const [row] = await db
        .select({
          id: regioes.id,
          codigoIbge: regioes.codigoIbge,
          nome: regioes.nome,
          tipo: regioes.tipo,
          uf: regioes.uf,
          estado: regioes.estado,
          latitude: regioes.latitude,
          longitude: regioes.longitude,
        })
        .from(regioes)
        .where(eq(regioes.id, id))

      if (!row) return c.json({ error: 'Região não encontrada' }, 404)
      return c.json(row)
    },
  )

  return app
}

describe('Regiões (IBGE)', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    app = createApp()
  })

  describe('GET /', () => {
    it('lists all regions', async () => {
      const res = await app.request('/')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toHaveLength(5)
    })

    it('filters by UF', async () => {
      const res = await app.request('/?uf=SP')
      const body = await res.json()
      expect(body).toHaveLength(2)
      for (const r of body) {
        expect(r.uf).toBe('SP')
      }
    })

    it('filters by tipo', async () => {
      const res = await app.request('/?tipo=estado')
      const body = await res.json()
      expect(body).toHaveLength(3)
      for (const r of body) {
        expect(r.tipo).toBe('estado')
      }
    })

    it('combines UF and tipo filters', async () => {
      const res = await app.request('/?uf=SP&tipo=municipio')
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].nome).toBe('São Paulo')
      expect(body[0].tipo).toBe('municipio')
    })

    it('searches by name', async () => {
      const res = await app.request('/?search=Acre')
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].uf).toBe('AC')
    })

    it('rejects invalid UF with 422', async () => {
      const res = await app.request('/?uf=XX')
      expect(res.status).toBe(422)
      const body = await res.json()
      expect(body.error).toContain('UF inválida')
    })

    it('respects limit', async () => {
      const res = await app.request('/?limit=2')
      const body = await res.json()
      expect(body).toHaveLength(2)
    })
  })

  describe('GET /:id', () => {
    it('returns region by id', async () => {
      const res = await app.request('/1')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.codigoIbge).toBe('35')
    })

    it('returns 404 for unknown id', async () => {
      const res = await app.request('/999')
      expect(res.status).toBe(404)
    })
  })
})
