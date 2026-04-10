import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { describe, expect, it } from 'vitest'

function createApp() {
  const app = new OpenAPIHono()

  app.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: {
        200: {
          description: 'ok',
          content: { 'application/json': { schema: z.object({ status: z.string() }) } },
        },
      },
    }),
    (c) => c.json({ status: 'ok' }),
  )

  return app
}

describe('Health', () => {
  it('returns ok', async () => {
    const app = createApp()
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})
