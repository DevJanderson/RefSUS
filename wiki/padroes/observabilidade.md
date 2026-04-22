# Observabilidade

Extraído de [`middleware/request-id.ts`](../../packages/api/src/middleware/request-id.ts) e [`middleware/error-handler.ts`](../../packages/api/src/middleware/error-handler.ts).

Stack hoje é mínima — sem APM, sem tracing distribuído. Base é `requestId` + `console` + tail log do Cloudflare. Suficiente no volume atual; revisitar quando ETL/dados vivos entrarem.

## requestId

Toda request ganha um UUID único logo no topo do middleware chain:

```ts
// middleware/request-id.ts
export const requestId = createMiddleware(async (c, next) => {
  const id = crypto.randomUUID()
  c.set('requestId', id)
  c.header('X-Request-Id', id)
  await next()
})
```

- **Header `X-Request-Id`** sai na resposta → cliente pode reportar
- **Context var `requestId`** → handlers e error handler leem via `c.get('requestId')`
- **Ordem importa:** `requestId` é o primeiro middleware em `app.ts`. Se entrar depois de outro que loga, o log fica sem correlação.

## Formato de log

Um único padrão pra log de erro:

```
[ERROR] [<requestId>] <method> <path>: <err.message>
```

Origem: `errorHandler`. Por quê esse formato:

- `[ERROR]` prefixo → grep simples em tail log
- `[requestId]` → cruza com o header que o cliente tem
- `method + path` → contexto sem precisar reconstruir da request
- `err.message` no final → humano lê rápido

Handlers de rota **não logam** diretamente. Deixam propagar pro `errorHandler` (ver [erros.md](erros.md)). Um log por request, um lugar.

## Onde os logs caem

| Ambiente | Saída |
|----------|-------|
| Dev (Node) | stdout do processo `pnpm dev:api` |
| Prod (Workers) | `wrangler tail` — stream em tempo real |

```bash
pnpm --filter api exec wrangler tail
```

Cloudflare Workers **não persiste log por padrão**. Tail é efêmero. Se precisar histórico, configurar Logpush (não feito hoje).

## Stack trace

- **Dev:** `errorHandler` inclui `stack` no body (`env.NODE_ENV === 'development'`)
- **Prod:** `stack` fica só no log do servidor — nunca vai no response

Cliente nunca deve depender de `stack`. É feature de dev.

## O que NÃO temos hoje

- ❌ APM (Sentry, Datadog) — não integrado
- ❌ Tracing distribuído — não aplicável (API sem dependências externas em runtime)
- ❌ Métricas customizadas (latência por rota, cache hit) — Cloudflare Analytics dá o básico
- ❌ Logpush — tail só

Ver [roadmap/volume-e-validacao.md](../roadmap/volume-e-validacao.md) pra quando faz sentido adicionar.

## Regras

- Todo log de erro passa pelo `errorHandler` — não duplicar em handler local
- `requestId` sempre presente no log (fallback `'unknown'` no error handler cobre edge case)
- Nunca logar payload de request que possa vazar dado sensível (hoje a API não recebe nenhum, mas manter disciplina)
- Log em PT-BR nas mensagens de usuário; técnico (`[ERROR]`, nomes de campo) fica em inglês
