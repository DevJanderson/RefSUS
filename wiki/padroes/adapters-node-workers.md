# Adapters — Node.js vs Cloudflare Workers

O mesmo `app.ts` roda em dois runtimes. Como funciona a ponte.

## Três entrypoints

```
src/
├── app.ts      # createApp() — shared (middleware, rotas, OpenAPI)
├── index.ts    # Node.js — dev local (tsx watch)
└── worker.ts   # Cloudflare Workers — produção
```

## `app.ts` — shared

```ts
export function createApp() {
  const app = new OpenAPIHono<AppEnv>()

  app.use(dbMiddleware)      // inicializa D1 em Workers, no-op em Node
  app.use(requestId)
  app.use(logger())
  app.use(cors({...}))
  app.use(secureHeaders())

  app.onError(errorHandler)
  app.notFound(notFound)

  app.route('/health', health)
  app.use('/v1/*', cacheHeaders)
  app.route('/v1/doencas', doencas)
  // ...

  app.doc('/openapi.json', {...})
  app.get('/docs', Scalar({...}))

  return app
}
```

**Tudo aqui funciona nos dois runtimes.** Nada Node-only.

## `index.ts` — Node

```ts
import { serve } from '@hono/node-server'
import { compress } from 'hono/compress'
import { createApp } from './app'
import { setDb } from './db'
import { getLocalDb } from './db/local'
import { apiRateLimit } from './middleware/rate-limit'
import { seed } from './seed'

// 1. Inicializa DB local ANTES de tudo
setDb(getLocalDb(env.DATABASE_URL))

// 2. Cria app e adiciona middleware Node-only
const app = createApp()
app.use(compress())           // Node-only (Workers comprime sozinho)
app.use(apiRateLimit)         // hono-rate-limiter — Node-only

// 3. Seed + serve
seed().then(() => {
  const server = serve({ fetch: app.fetch, port: env.PORT }, ...)

  // Graceful shutdown
  const shutdown = () => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10_000)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
})
```

O que é Node-only aqui:
- `serve()` — @hono/node-server
- `compress()` — usa zlib de Node
- `apiRateLimit` — hono-rate-limiter (in-memory, não escala)
- `process.on(...)` — signals
- `seed()` — lê arquivos do filesystem

## `worker.ts` — Cloudflare Workers

```ts
import { createApp } from './app'

const app = createApp()

export default app
```

É isso. Workers só precisa exportar algo com `.fetch()`.

**O DB vem via binding** — o `dbMiddleware` pega de `c.env.DB` a cada request:

```ts
// src/middleware/db.ts
export const dbMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const d1 = c.env?.DB
  if (d1) setDb(createD1Db(d1))
  await next()
}
```

## O `db` proxy — truque pra não mudar rotas

Rotas sempre importam:

```ts
import { db } from '../db'
```

Mas `db` não é o objeto real — é um proxy:

```ts
// src/db/index.ts
let _db: AppDb | null = null

export function setDb(instance: AppDb) {
  _db = instance
}

export const db: AppDb = new Proxy({} as AppDb, {
  get(_target, prop) {
    if (!_db) throw new Error('DB not initialized — ensure db middleware is registered')
    return (_db as any)[prop]
  },
})
```

Quem setta:
- **Node**: `setDb(getLocalDb(...))` no `index.ts` antes do serve
- **Workers**: `setDb(createD1Db(c.env.DB))` a cada request no `dbMiddleware`

Vantagem: zero refator das rotas entre runtimes.

Risco: `_db` é **singleton global**. Em Workers é OK porque cada request tem um isolado V8 novo, mas em multi-tenancy/testes precisa cuidado.

## `wrangler.toml` — config Workers

```toml
name = "refsus-api"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "refsus-db"
database_id = "auto-generated"
```

O `binding = "DB"` é o nome que aparece em `c.env.DB` no código.

## Bindings tipados

```ts
// src/types.ts
export type Bindings = {
  DB: D1Database
}

export type AppEnv = {
  Bindings: Bindings
}
```

`AppEnv` vai em `OpenAPIHono<AppEnv>` e `MiddlewareHandler<AppEnv>`. Aí `c.env.DB` fica tipado.

## O que tem diferença entre os runtimes

| Recurso | Node | Workers |
|---------|------|---------|
| DB | SQLite local (better-sqlite3) | D1 binding |
| Rate limit | hono-rate-limiter (in-memory) | Cloudflare Rate Limiting Rules |
| Compression | `hono/compress` (zlib) | Automático no CF |
| FS | `fs` disponível | ❌ não tem |
| `process.env` | tudo | só bindings + vars declaradas |
| Crypto | `crypto` Node | `crypto` Web (API diferente) |
| Timers | `setInterval` livre | limitado, CPU time cap |
| Graceful shutdown | SIGTERM signal | não existe |
| Logs | stdout | `console.log` → wrangler tail |

## `env.ts` — single source pra config

```ts
// src/env.ts (estrutura típica)
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? 'data/referencia.db',
  PORT: Number(process.env.PORT ?? 8003),
}
```

Lê só `process.env` — **só funciona em Node**. Em Workers, config vem via `c.env` e bindings. `env.ts` não é importado em `worker.ts`.

## Anti-padrões

- ❌ Importar `fs`, `path`, `process` em `app.ts` ou rotas — quebra Workers
- ❌ `app.ts` usando `better-sqlite3` direto — usa o proxy
- ❌ `index.ts` e `worker.ts` compondo rotas diferente — sempre via `createApp()`
- ❌ Middleware assumindo Node (`compress`, `apiRateLimit`) em `app.ts`
- ❌ State global mutável fora do `_db` (viable em Workers por isolamento, mas **cuidado**)

## Testar os dois runtimes localmente

```bash
pnpm dev            # Node (index.ts)
pnpm dev:worker     # Workers simulado (wrangler dev)
```

Rodar ambos antes de merge pra garantir que app.ts continua cross-runtime.
