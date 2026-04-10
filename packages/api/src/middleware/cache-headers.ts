import { createMiddleware } from 'hono/factory'

export const cacheHeaders = createMiddleware(async (c, next) => {
  await next()
  if (c.res.status === 200) {
    c.res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }
})
