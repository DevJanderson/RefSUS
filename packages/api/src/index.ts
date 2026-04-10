import { serve } from '@hono/node-server'
import { compress } from 'hono/compress'
import { createApp } from './app'
import { setDb } from './db'
import { getLocalDb } from './db/local'
import { env } from './env'
import { apiRateLimit } from './middleware/rate-limit'
import { seed } from './seed'

// Initialize local SQLite before seed runs
setDb(getLocalDb(env.DATABASE_URL))

const app = createApp()

// Node.js-only middleware (not available in Workers)
app.use(compress())
app.use(apiRateLimit)

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
