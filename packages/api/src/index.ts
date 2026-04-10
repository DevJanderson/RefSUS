import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './env'
import { cacheHeaders } from './middleware/cache-headers'
import { errorHandler } from './middleware/error-handler'
import { notFound } from './middleware/not-found'
import { apiRateLimit } from './middleware/rate-limit'
import { requestId } from './middleware/request-id'
import doencas from './routes/doencas'
import fluxo from './routes/fluxo'
import health from './routes/health'
import notificacao from './routes/notificacao'
import regioes from './routes/regioes'
import sintomas from './routes/sintomas'
import stats from './routes/stats'
import { seed } from './seed'

const app = new OpenAPIHono()

// Global middleware
app.use(requestId)
app.use(logger())
app.use(compress())
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
)
app.use(secureHeaders())
app.use(apiRateLimit)

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
  servers: [{ url: `http://localhost:${env.PORT}` }],
})

app.get('/docs', Scalar({ url: '/openapi.json', theme: 'kepler' }))

// Seed + start
seed().then(() => {
  const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`[${env.NODE_ENV}] RefSUS running at http://localhost:${info.port}`)
    console.log(`[${env.NODE_ENV}] Docs at http://localhost:${info.port}/docs`)
  })

  const shutdown = () => {
    console.log('\nShutting down gracefully...')
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
})

export { app }
