# Rotas Hono + OpenAPI

Padrão canônico de uma rota no RefSUS. Extraído de [`packages/api/src/routes/doencas.ts`](../../packages/api/src/routes/doencas.ts).

## Anatomia

```ts
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { and, count, eq, like, or, type SQL } from 'drizzle-orm'
import { db } from '../db'
import { doencas } from '../db/schema'
import { ErrorSchema, listResponseSchema, PaginationQuery } from '../schemas/shared'

const app = new OpenAPIHono()

// 1. Schema do recurso (tipado + OpenAPI)
const DoencaSchema = z
  .object({
    id: z.number(),
    codigo: z.string().openapi({ example: 'A00' }),
    nome: z.string().openapi({ example: 'Cólera' }),
    descricao: z.string().nullable(),
    capitulo: z.string().nullable(),
    categoria: z.string().nullable(),
  })
  .openapi('Doenca')  // registra como named schema no OpenAPI

// 2. Select shape reutilizado
const selectFields = {
  id: doencas.id,
  codigo: doencas.codigo,
  nome: doencas.nome,
  descricao: doencas.descricao,
  capitulo: doencas.capitulo,
  categoria: doencas.categoria,
}

// 3. Rota com createRoute + handler
app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Doenças (CID-10)'],
    summary: 'List diseases with search and filtering',
    request: {
      query: PaginationQuery.extend({
        q: z.string().optional().openapi({ description: 'Search by nome or codigo' }),
      }),
    },
    responses: {
      200: {
        description: 'Paginated list',
        content: { 'application/json': { schema: listResponseSchema(DoencaSchema) } },
      },
    },
  }),
  async (c) => {
    const { q, limit, offset } = c.req.valid('query')
    // ...
    return c.json({ data, meta: { total, limit, offset } })
  },
)

export default app
```

## Regras obrigatórias

### Uma rota = um `createRoute` + um handler

Nada de `app.get('/x', handler)` cru. Sempre `app.openapi(createRoute({...}), handler)`. Isso garante:

- Validação automática do input (`c.req.valid('query'|'param'|'json')`)
- Geração automática de OpenAPI → Scalar docs sempre atualizada
- Type safety end-to-end

### `tags` em PT-BR, agrupando por domínio

```ts
tags: ['Doenças (CID-10)']
tags: ['Notificação Compulsória']
tags: ['Regiões (IBGE)']
```

Scalar agrupa as rotas na sidebar por tag.

### `summary` em inglês é OK, `description` em PT-BR se tiver

Scalar renderiza `summary` no lado da rota. Hoje o código mistura (ex: `'List diseases with search and filtering'`) — **tendência é padronizar em PT-BR quando a API for pública**. Por enquanto, consistência com o existente.

### Responses sempre têm schema

Mesmo pra 404/500, usar `ErrorSchema`:

```ts
responses: {
  200: { description: 'OK', content: { 'application/json': { schema: XSchema } } },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
}
```

### Handler retorna `c.json({ data, meta })`

```ts
// ✅ Lista
return c.json({ data, meta: { total, limit, offset } })

// ✅ Único
return c.json({ data: row }, 200 as const)

// ❌ Array cru
return c.json(rows)

// ❌ Sem envelope
return c.json(row)
```

O `as const` em `200 as const` força TS a reconhecer o status literal (necessário por causa do union type do `responses`).

## Ordem de rotas — catch-alls no final

Rota dinâmica `/:id` pega qualquer path. Se vier antes, captura `/capitulos`, `/autocomplete`, etc.

```ts
app.openapi({ path: '/' }, ...)              // 1. list
app.openapi({ path: '/codigo/{codigo}' }, ...) // 2. lookup específico
app.openapi({ path: '/autocomplete' }, ...)   // 3. específico
app.openapi({ path: '/capitulos' }, ...)      // 4. específico
app.openapi({ path: '/{id}' }, ...)           // 5. catch-all POR ÚLTIMO
```

No código: ver comentário `// GET BY ID (must be last — /{id} is a catch-all param)` em `doencas.ts`.

## Validação de input

`c.req.valid()` retorna o objeto já tipado e validado pelo Zod:

```ts
const { codigo } = c.req.valid('param')     // path params
const { q, limit, offset } = c.req.valid('query')  // query string
const body = c.req.valid('json')            // JSON body (POST/PUT)
```

Se a validação falha, Hono retorna 400 automaticamente.

### Coerção de query string

Query string é string. Pra aceitar número:

```ts
z.coerce.number().int().min(0).default(0)
```

## Filtros dinâmicos — padrão `conditions[]`

```ts
const conditions: SQL[] = []
if (q) conditions.push(or(like(doencas.nome, `%${q}%`), like(doencas.codigo, `%${q}%`))!)
if (capitulo) conditions.push(eq(doencas.capitulo, capitulo))
const where = conditions.length > 0 ? and(...conditions) : undefined

await db.select().from(doencas).where(where)
```

`!` no `or(...)` é porque o tipo retorna `SQL | undefined` quando recebe array vazio — mas como passamos args concretos, garantimos não-undefined.

## Paginação — data + count em paralelo

Sempre retornar total pra cliente saber se paginar:

```ts
const [data, [{ total }]] = await Promise.all([
  db.select(selectFields).from(doencas).where(where).limit(limit).offset(offset),
  db.select({ total: count() }).from(doencas).where(where),
])

return c.json({ data, meta: { total, limit, offset } })
```

O array destructuring `[{ total }]` é porque `select({ total: count() })` retorna `[{ total: N }]`.

## Lookup 404

Padrão:

```ts
const [row] = await db.select(selectFields).from(doencas).where(eq(doencas.codigo, codigo))

if (!row)
  return c.json(
    { error: { code: 'RESOURCE_NOT_FOUND', message: `Código '${codigo}' não encontrado`, status: 404 } },
    404,
  )
return c.json({ data: row }, 200 as const)
```

- `[row] = ...` pega o primeiro, `row` é `undefined` se vazio
- Mensagem em PT-BR, inclui o valor procurado
- `code` em ENGLISH_UPPER (identificador técnico, não texto)
- `status` no error body bate com status HTTP

## Facets (valores distintos)

```ts
const rows = await db
  .selectDistinct({ capitulo: doencas.capitulo })
  .from(doencas)
  .orderBy(doencas.capitulo)

return c.json({ data: rows.map(r => r.capitulo).filter((v): v is string => v !== null) })
```

Type guard `(v): v is string` pra remover nulls mantendo inferência.

## Normalização de input

Códigos CID-10 e IBGE são comparados em uppercase:

```ts
const upper = codigo.toUpperCase()
await db.select().from(doencas).where(eq(doencas.codigo, upper))
```

Fazer **antes** do query, não no WHERE com `UPPER()` (performance + index usage).

## Checklist de rota nova

- [ ] Schema do recurso com `.openapi('Nome')`
- [ ] `selectFields` se o shape de retorno é reutilizado
- [ ] `tags` agrupando por domínio
- [ ] `summary` descritivo
- [ ] Responses 200 + 404/422 conforme aplicável, com schemas
- [ ] Handler usa `c.req.valid()` pra input
- [ ] Retorna `{ data, meta }` em lista, `{ data }` em único
- [ ] Catch-all `/{id}` por último no arquivo
- [ ] Teste em `tests/<rota>.test.ts`
- [ ] Atualizar [`docs/referencia/endpoints.md`](../../docs/referencia/endpoints.md)
