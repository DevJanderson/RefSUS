import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, eq, like, type SQL } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { doencas } from '../src/db/schema'
import { createTestDb } from '../src/db/test-db'

function seedDoencas(db: ReturnType<typeof createTestDb>) {
  const data = [
    { codigo: 'A00', nome: 'Cólera', capitulo: 'I - Infecciosas', categoria: 'A00-A09' },
    { codigo: 'A01', nome: 'Febre tifóide', capitulo: 'I - Infecciosas', categoria: 'A00-A09' },
    { codigo: 'B00', nome: 'Herpes viral', capitulo: 'I - Infecciosas', categoria: 'B00-B09' },
    { codigo: 'J00', nome: 'Resfriado comum', capitulo: 'X - Respiratórias', categoria: 'J00-J06' },
    { codigo: 'J01', nome: 'Sinusite aguda', capitulo: 'X - Respiratórias', categoria: 'J00-J06' },
  ]
  for (const d of data) {
    db.insert(doencas).values(d).run()
  }
}

function createApp() {
  const db = createTestDb()
  seedDoencas(db)
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
      },
      request: {
        query: z.object({
          search: z.string().optional(),
          capitulo: z.string().optional(),
          categoria: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).default(100),
          offset: z.coerce.number().int().min(0).default(0),
        }),
      },
    }),
    async (c) => {
      const { search, capitulo, categoria, limit, offset } = c.req.valid('query')
      const conditions: SQL[] = []
      if (search) conditions.push(like(doencas.nome, `%${search}%`))
      if (capitulo) conditions.push(eq(doencas.capitulo, capitulo))
      if (categoria) conditions.push(eq(doencas.categoria, categoria))
      const where = conditions.length > 0 ? and(...conditions) : undefined

      const data = await db
        .select({
          id: doencas.id,
          codigo: doencas.codigo,
          nome: doencas.nome,
          descricao: doencas.descricao,
          capitulo: doencas.capitulo,
          categoria: doencas.categoria,
        })
        .from(doencas)
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
          id: doencas.id,
          codigo: doencas.codigo,
          nome: doencas.nome,
          descricao: doencas.descricao,
          capitulo: doencas.capitulo,
          categoria: doencas.categoria,
        })
        .from(doencas)
        .where(eq(doencas.id, id))

      if (!row) return c.json({ error: 'Doença não encontrada' }, 404)
      return c.json(row)
    },
  )

  return app
}

describe('Doenças (CID-10)', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    app = createApp()
  })

  describe('GET /', () => {
    it('lists all diseases', async () => {
      const res = await app.request('/')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toHaveLength(5)
    })

    it('searches by name', async () => {
      const res = await app.request('/?search=Cólera')
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].codigo).toBe('A00')
    })

    it('filters by capitulo', async () => {
      const res = await app.request(`/?capitulo=${encodeURIComponent('X - Respiratórias')}`)
      const body = await res.json()
      expect(body).toHaveLength(2)
    })

    it('filters by categoria', async () => {
      const res = await app.request('/?categoria=B00-B09')
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].codigo).toBe('B00')
    })

    it('respects limit and offset', async () => {
      const res = await app.request('/?limit=2&offset=1')
      const body = await res.json()
      expect(body).toHaveLength(2)
      expect(body[0].codigo).toBe('A01')
    })
  })

  describe('GET /:id', () => {
    it('returns disease by id', async () => {
      const res = await app.request('/1')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.codigo).toBe('A00')
    })

    it('returns 404 for unknown id', async () => {
      const res = await app.request('/999')
      expect(res.status).toBe(404)
    })
  })
})
