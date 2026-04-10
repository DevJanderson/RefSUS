import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { eq, like, type SQL } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { sintomas } from '../src/db/schema'
import { createTestDb } from '../src/db/test-db'

function seedSintomas(db: ReturnType<typeof createTestDb>) {
  const data = [
    { codigo: 'R00', nome: 'Anormalidades do batimento cardíaco' },
    { codigo: 'R00.0', nome: 'Taquicardia não especificada' },
    { codigo: 'R01', nome: 'Sopros e outros sons cardíacos' },
    { codigo: 'R10', nome: 'Dor abdominal e pélvica' },
  ]
  for (const d of data) {
    db.insert(sintomas).values(d).run()
  }
}

function createApp() {
  const db = createTestDb()
  seedSintomas(db)
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
          limit: z.coerce.number().int().min(1).max(100).default(100),
          offset: z.coerce.number().int().min(0).default(0),
        }),
      },
    }),
    async (c) => {
      const { search, limit, offset } = c.req.valid('query')
      const where: SQL | undefined = search ? like(sintomas.nome, `%${search}%`) : undefined

      const data = await db
        .select({
          id: sintomas.id,
          codigo: sintomas.codigo,
          nome: sintomas.nome,
          descricao: sintomas.descricao,
        })
        .from(sintomas)
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
          id: sintomas.id,
          codigo: sintomas.codigo,
          nome: sintomas.nome,
          descricao: sintomas.descricao,
        })
        .from(sintomas)
        .where(eq(sintomas.id, id))

      if (!row) return c.json({ error: 'Sintoma não encontrado' }, 404)
      return c.json(row)
    },
  )

  return app
}

describe('Sintomas (CID-10)', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    app = createApp()
  })

  describe('GET /', () => {
    it('lists all symptoms', async () => {
      const res = await app.request('/')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toHaveLength(4)
    })

    it('searches by name', async () => {
      const res = await app.request('/?search=Taquicardia')
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].codigo).toBe('R00.0')
    })

    it('respects limit', async () => {
      const res = await app.request('/?limit=2')
      const body = await res.json()
      expect(body).toHaveLength(2)
    })
  })

  describe('GET /:id', () => {
    it('returns symptom by id', async () => {
      const res = await app.request('/1')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.codigo).toBe('R00')
    })

    it('returns 404 for unknown id', async () => {
      const res = await app.request('/999')
      expect(res.status).toBe(404)
    })
  })
})
