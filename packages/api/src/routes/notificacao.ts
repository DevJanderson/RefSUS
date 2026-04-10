import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { count, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { notificacaoCid, notificacaoCompulsoria } from '../db/schema'
import { ErrorSchema } from '../schemas/shared'

const app = new OpenAPIHono()

const NotificacaoSchema = z
  .object({
    id: z.number(),
    agravo: z.string().openapi({ example: 'Dengue' }),
    tipoNotificacao: z.string().openapi({ example: 'semanal' }),
    codigosCid: z.array(z.string()).openapi({ example: ['A90', 'A91'] }),
  })
  .openapi('NotificacaoCompulsoria')

// ── LIST ──────────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Notificação Compulsória'],
    summary: 'List all compulsory notification diseases',
    request: {
      query: z.object({
        tipo: z
          .enum(['imediata', 'semanal'])
          .optional()
          .openapi({ description: 'Filter by notification type' }),
      }),
    },
    responses: {
      200: {
        description: 'List of compulsory notification diseases',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(NotificacaoSchema),
              meta: z.object({
                total: z.number(),
                imediatas: z.number(),
                semanais: z.number(),
              }),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { tipo } = c.req.valid('query')

    const where = tipo ? eq(notificacaoCompulsoria.tipoNotificacao, tipo) : undefined

    const agravos = await db
      .select()
      .from(notificacaoCompulsoria)
      .where(where)
      .orderBy(notificacaoCompulsoria.agravo)

    const data = await Promise.all(
      agravos.map(async (a) => {
        const cids = await db
          .select({ codigo: notificacaoCid.codigoCid })
          .from(notificacaoCid)
          .where(eq(notificacaoCid.notificacaoId, a.id))

        return {
          id: a.id,
          agravo: a.agravo,
          tipoNotificacao: a.tipoNotificacao,
          codigosCid: cids.map((c) => c.codigo),
        }
      }),
    )

    const [[{ imediatas }], [{ semanais }]] = await Promise.all([
      db
        .select({ imediatas: count() })
        .from(notificacaoCompulsoria)
        .where(eq(notificacaoCompulsoria.tipoNotificacao, 'imediata')),
      db
        .select({ semanais: count() })
        .from(notificacaoCompulsoria)
        .where(eq(notificacaoCompulsoria.tipoNotificacao, 'semanal')),
    ])

    return c.json({
      data,
      meta: { total: data.length, imediatas, semanais },
    })
  },
)

// ── CHECK CID-10 CODE ─────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/verificar/{codigo}',
    tags: ['Notificação Compulsória'],
    summary: 'Check if a CID-10 code requires compulsory notification',
    request: {
      params: z.object({
        codigo: z.string().openapi({ example: 'A90', description: 'CID-10 code' }),
      }),
    },
    responses: {
      200: {
        description: 'Notification info for this code',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                codigo: z.string(),
                notificacaoCompulsoria: z.boolean(),
                agravos: z.array(
                  z.object({
                    agravo: z.string(),
                    tipoNotificacao: z.string(),
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
    const { codigo } = c.req.valid('param')
    const upper = codigo.toUpperCase()

    const matches = await db
      .select({
        agravo: notificacaoCompulsoria.agravo,
        tipoNotificacao: notificacaoCompulsoria.tipoNotificacao,
      })
      .from(notificacaoCid)
      .innerJoin(
        notificacaoCompulsoria,
        eq(notificacaoCid.notificacaoId, notificacaoCompulsoria.id),
      )
      .where(eq(notificacaoCid.codigoCid, upper))

    return c.json({
      data: {
        codigo: upper,
        notificacaoCompulsoria: matches.length > 0,
        agravos: matches.map((m) => ({
          agravo: m.agravo,
          tipoNotificacao: m.tipoNotificacao,
        })),
      },
    })
  },
)

// ── GET BY ID ─────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Notificação Compulsória'],
    summary: 'Get compulsory notification disease by ID',
    request: {
      params: z.object({ id: z.coerce.number().openapi({ example: 1 }) }),
    },
    responses: {
      200: {
        description: 'Found',
        content: {
          'application/json': {
            schema: z.object({ data: NotificacaoSchema }),
          },
        },
      },
      404: {
        description: 'Not found',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param')

    const [agravo] = await db
      .select()
      .from(notificacaoCompulsoria)
      .where(eq(notificacaoCompulsoria.id, id))

    if (!agravo)
      return c.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Agravo não encontrado',
            status: 404,
          },
        },
        404,
      )

    const cids = await db
      .select({ codigo: notificacaoCid.codigoCid })
      .from(notificacaoCid)
      .where(eq(notificacaoCid.notificacaoId, id))

    return c.json(
      {
        data: {
          id: agravo.id,
          agravo: agravo.agravo,
          tipoNotificacao: agravo.tipoNotificacao,
          codigosCid: cids.map((c) => c.codigo),
        },
      },
      200 as const,
    )
  },
)

export default app
