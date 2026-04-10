import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['System'],
    summary: 'Liveness check',
    responses: {
      200: {
        description: 'Service is alive',
        content: { 'application/json': { schema: z.object({ status: z.string() }) } },
      },
    },
  }),
  (c) => c.json({ status: 'ok' }),
)

app.openapi(
  createRoute({
    method: 'get',
    path: '/ready',
    tags: ['System'],
    summary: 'Readiness check (verifies DB)',
    responses: {
      200: {
        description: 'Service is ready',
        content: { 'application/json': { schema: z.object({ status: z.string() }) } },
      },
      503: {
        description: 'Service is not ready',
        content: { 'application/json': { schema: z.object({ status: z.string() }) } },
      },
    },
  }),
  async (c) => {
    try {
      db.run(sql`SELECT 1`)
      return c.json({ status: 'ready' })
    } catch {
      return c.json({ status: 'unhealthy' }, 503)
    }
  },
)

export default app
