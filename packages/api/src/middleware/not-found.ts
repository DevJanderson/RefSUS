import type { NotFoundHandler } from 'hono'

export const notFound: NotFoundHandler = (c) => {
  return c.json({ error: `Route not found: ${c.req.method} ${c.req.path}` }, 404)
}
