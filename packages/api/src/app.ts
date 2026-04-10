import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { cacheHeaders } from './middleware/cache-headers'
import { dbMiddleware } from './middleware/db'
import { errorHandler } from './middleware/error-handler'
import { notFound } from './middleware/not-found'
import { requestId } from './middleware/request-id'
import doencas from './routes/doencas'
import fluxo from './routes/fluxo'
import health from './routes/health'
import notificacao from './routes/notificacao'
import regioes from './routes/regioes'
import sintomas from './routes/sintomas'
import stats from './routes/stats'
import type { AppEnv } from './types'

export function createApp() {
  const app = new OpenAPIHono<AppEnv>()

  // Global middleware
  app.use(dbMiddleware)
  app.use(requestId)
  app.use(logger())
  app.use(
    cors({
      origin: '*',
      allowMethods: ['GET', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      maxAge: 86400,
    }),
  )
  app.use(secureHeaders())

  // Error handling
  app.onError(errorHandler)
  app.notFound(notFound)

  // Public routes
  app.route('/health', health)

  // Data routes (cached 1h)
  app.use('/v1/*', cacheHeaders)
  app.route('/v1/doencas', doencas)
  app.route('/v1/sintomas', sintomas)
  app.route('/v1/regioes', regioes)
  app.route('/v1/notificacao-compulsoria', notificacao)
  app.route('/v1/fluxo-notificacao', fluxo)
  app.route('/v1/stats', stats)

  // OpenAPI spec
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'RefSUS API',
      version: '1.0.0',
      description:
        'API pública de dados de referência do SUS — CID-10, sintomas, regiões IBGE, notificação compulsória e fluxos oficiais.',
    },
  })

  app.get('/docs', Scalar({ url: '/openapi.json', theme: 'kepler' }))

  return app
}
