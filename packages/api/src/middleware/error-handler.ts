import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { env } from '../env'

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') ?? 'unknown'
  console.error(`[ERROR] [${requestId}] ${c.req.method} ${c.req.path}:`, err.message)

  const status = ('status' in err ? (err.status as number) : 500) as ContentfulStatusCode

  return c.json(
    {
      error: status >= 500 ? 'Internal Server Error' : err.message,
      requestId,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    status,
  )
}
