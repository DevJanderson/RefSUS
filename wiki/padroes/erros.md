# Erros e respostas de erro

Extraído de [`middleware/error-handler.ts`](../../packages/api/src/middleware/error-handler.ts), [`schemas/shared.ts`](../../packages/api/src/schemas/shared.ts) e rotas.

## Schema canônico

```ts
export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string(),         // identificador técnico em UPPER_SNAKE
      message: z.string(),      // mensagem em PT-BR, acionável
      status: z.number(),       // mesmo status HTTP do response
    }),
  })
  .openapi('Error')
```

## Formato de resposta

### 404 — recurso não encontrado

```ts
return c.json(
  {
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Código CID-10 '${codigo}' não encontrado`,
      status: 404,
    },
  },
  404,
)
```

- `code`: identificador técnico em inglês, UPPER_SNAKE. Cliente pode matchar programaticamente.
- `message`: PT-BR, **inclui o valor procurado** pra ajudar debug.

### 422 — validação (automático do Hono)

Hono + zod-openapi tratam validação sozinhos. Resposta default é OK pro projeto — não reescrevemos. Shape:

```json
{
  "success": false,
  "error": {
    "issues": [{ "code": "invalid_type", "path": ["limit"], "message": "..." }],
    "name": "ZodError"
  }
}
```

**Melhoria pendente:** normalizar pro formato `ErrorSchema` via hook de `createRoute`. Hoje ainda não é feito.

### 500 — erro interno (via `errorHandler`)

```ts
// middleware/error-handler.ts
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
```

Notas:
- `requestId` no body — cliente reporta isso, a gente acha o log
- `stack` **só em dev** (nunca vazar em prod)
- 5xx retorna mensagem genérica (`'Internal Server Error'`) — detalhe só no log
- 4xx pode mostrar `err.message` diretamente

### 404 global (route inexistente)

```ts
// middleware/not-found.ts
export const notFound: NotFoundHandler = (c) => {
  return c.json({ error: `Route not found: ${c.req.method} ${c.req.path}` }, 404)
}
```

**Gap atual:** esse formato **não segue** `ErrorSchema`. Deveria ser:

```ts
return c.json({
  error: {
    code: 'ROUTE_NOT_FOUND',
    message: `Rota não encontrada: ${c.req.method} ${c.req.path}`,
    status: 404,
  },
}, 404)
```

Pendente: alinhar `not-found.ts` ao `ErrorSchema` (usar `code: 'ROUTE_NOT_FOUND'`). Não é bloqueador — consumidores já tratam 404 via status HTTP.

## Códigos de `error.code` usados

| Code | Status | Quando |
|------|--------|--------|
| `RESOURCE_NOT_FOUND` | 404 | Lookup por chave não achou |
| `VALIDATION_ERROR` | 422 | (planejado) Zod falhou |
| `ROUTE_NOT_FOUND` | 404 | (planejado) Rota inexistente |
| `RATE_LIMITED` | 429 | (planejado) Rate limit |
| `INTERNAL_ERROR` | 500 | (planejado) 5xx catch-all |

**Adicionar code novo:** registrar aqui e documentar em [`docs/referencia/erros.md`](../../docs/referencia/erros.md).

## Lançar exceção em handler

Quando erro é inesperado, **não trate localmente**. Deixe propagar pro `errorHandler`:

```ts
// ✅ deixa propagar
async (c) => {
  const data = await externalCall()  // se falha, errorHandler pega
  return c.json({ data })
}

// ❌ engole
async (c) => {
  try {
    const data = await externalCall()
    return c.json({ data })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Erro' }, 500)  // duplica trabalho do errorHandler
  }
}
```

Exceção: erros **esperados e tratáveis** (ex: retry, fallback). Aí trata local.

## HTTPException (pra erros customizados)

```ts
import { HTTPException } from 'hono/http-exception'

throw new HTTPException(403, { message: 'Acesso negado' })
```

O `errorHandler` pega via `('status' in err)`. Formato de resposta fica padronizado.

## Erros em dev vs prod

Controlado por `env.NODE_ENV`:

- **dev**: response inclui `stack`, mensagens mais detalhadas
- **prod**: stack fica só no log, response é mínima

Cliente nunca deve depender de `stack`. É feature de dev.

## Logging de erro

```ts
console.error(`[ERROR] [${requestId}] ${c.req.method} ${c.req.path}:`, err.message)
```

Formato:
- `[ERROR]` prefixo
- `[${requestId}]` correlação
- `${method} ${path}` contexto
- `err.message` mensagem

Em Cloudflare Workers, `console.error` vai pro **tail log** (wrangler tail).

Ver [observabilidade.md](observabilidade.md) pra detalhe.

## Anti-padrões

- ❌ `return c.json({ error: 'mensagem solta' })` — usar `{ error: { code, message, status } }`
- ❌ Expor `stack` em produção
- ❌ Status HTTP e `error.status` divergindo
- ❌ `code` em PT-BR ou minúsculo — padrão é `UPPER_SNAKE_CASE`
- ❌ `message` em inglês (o público é BR)
- ❌ Engolir exceção com `try/catch` quando podia propagar
