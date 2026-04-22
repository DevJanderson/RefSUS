# Middleware

Todos em [`packages/api/src/middleware/`](../../packages/api/src/middleware/).

## Ordem de execução

Em `app.ts` (`createApp()`):

```ts
app.use(dbMiddleware)      // 1. inicializa DB (D1 em Workers)
app.use(requestId)         // 2. gera X-Request-Id
app.use(logger())          // 3. log da request
app.use(cors({...}))       // 4. CORS headers
app.use(secureHeaders())   // 5. headers de segurança

app.onError(errorHandler)  // erro handler global
app.notFound(notFound)     // 404 handler global

app.route('/health', health)
app.use('/v1/*', cacheHeaders)  // cache SÓ em /v1/*
app.route('/v1/doencas', doencas)
// ...
```

### Por que essa ordem

1. `dbMiddleware` **primeiro** — o handler precisa de `db` disponível
2. `requestId` **antes do logger** — log inclui o ID
3. `logger` **antes do CORS** — loga mesmo preflights (debugging)
4. `cors` **antes dos handlers** — responde preflight sem executar rota
5. `cacheHeaders` **escopado em `/v1/*`** — `/health` não cacheia

## Padrão: `createMiddleware`

Pra middleware simples, use a factory do Hono:

```ts
import { createMiddleware } from 'hono/factory'

export const requestId = createMiddleware(async (c, next) => {
  const id = crypto.randomUUID()
  c.set('requestId', id)
  c.header('X-Request-Id', id)
  await next()
})
```

`await next()` é obrigatório — sem ele, o handler não roda.

## Padrão: middleware tipado (`MiddlewareHandler`)

Pra middleware que precisa do tipo do env (ex: D1 binding):

```ts
import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'

export const dbMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const d1 = c.env?.DB
  if (d1) setDb(createD1Db(d1))
  await next()
}
```

## Padrão: middleware que roda *depois* do handler

```ts
export const cacheHeaders = createMiddleware(async (c, next) => {
  await next()  // 1. handler roda primeiro
  if (c.res.status === 200) {
    c.res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }
})
```

`c.res` só existe após `await next()`. Útil pra post-processing.

## Middleware por escopo

```ts
app.use('/v1/*', cacheHeaders)    // só em /v1/*
app.use('/admin/*', authMiddleware)  // só em /admin/*
```

Escopo em glob. Mais eficiente que checar path dentro do middleware.

## Context vars (`c.set` / `c.get`)

```ts
// Middleware escreve
c.set('requestId', id)

// Handler (ou outro middleware) lê
const id = c.get('requestId')
```

Pra type safety, declarar em `types.ts`:

```ts
export type AppEnv = {
  Bindings: { DB: D1Database }
  Variables: {
    requestId: string
    userId?: string  // exemplo
  }
}
```

Hoje o projeto tem `Bindings` mas **não tem `Variables`** — `c.get('requestId')` retorna `any`. Melhoria pendente.

## Middleware node-only vs shared

Alguns middleware só existem em Node (não compatível com CF Workers):

```ts
// packages/api/src/index.ts (Node entrypoint)
import { compress } from 'hono/compress'
import { apiRateLimit } from './middleware/rate-limit'

const app = createApp()
app.use(compress())         // Node-only
app.use(apiRateLimit)       // Node-only (hono-rate-limiter)
```

**Não colocar isso em `app.ts`** — quebraria o Worker. Em Workers, CORS e secureHeaders são mais que suficientes; rate limit vira responsabilidade do Cloudflare (WAF/Rules).

## Rate limit (Node dev)

```ts
import { rateLimiter } from 'hono-rate-limiter'

export const apiRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
  message: { error: 'Too many requests, try again later' },
})
```

Em produção (Workers): usar Cloudflare Rate Limiting Rules no dashboard. Mais barato, mais escalável que fazer no Worker.

## Error handler (global)

```ts
app.onError(errorHandler)
```

Não é `use` — registra só uma vez via `onError`. Pega qualquer exception não tratada em handler ou middleware.

Ver [erros.md](erros.md) pro detalhe.

## Not found

```ts
app.notFound(notFound)
```

Roda quando nenhuma rota casa. Hoje retorna:

```ts
c.json({ error: `Route not found: ${c.req.method} ${c.req.path}` }, 404)
```

## Anti-padrões

- ❌ Middleware que **não chama `await next()`** (a menos que intencionalmente aborte)
- ❌ Middleware com lógica de domínio (ex: validar regra de negócio) — isso é responsabilidade do handler
- ❌ `app.use(middleware, { path: '/x' })` — use `app.use('/x', middleware)` (API correta do Hono)
- ❌ Misturar middleware Node-only em `app.ts` (quebra Workers)
- ❌ Esquecer de declarar `Variables` em `AppEnv` quando adicionar `c.set(...)` novo
