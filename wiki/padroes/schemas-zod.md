# Schemas Zod

Extraído de [`packages/api/src/schemas/shared.ts`](../../packages/api/src/schemas/shared.ts) e rotas.

## Regras

1. **Zod é a fonte do tipo.** Nunca declarar `type X = {}` e `const xSchema = z.object({})` em paralelo. Extrair via `z.infer<typeof xSchema>` quando precisar do tipo.
2. **Schemas reutilizáveis em `schemas/shared.ts`.** Schemas de um recurso específico ficam no arquivo da rota.
3. **`@hono/zod-openapi`** exporta `z` com `.openapi()` adicional — usar esse `z`, nunca `zod` direto.

## Schemas compartilhados (o que já existe)

### `PaginationQuery`

```ts
export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100).openapi({ example: 100 }),
  offset: z.coerce.number().int().min(0).default(0).openapi({ example: 0 }),
})
```

Uso em rotas que paginam:

```ts
request: {
  query: PaginationQuery.extend({
    q: z.string().optional(),
    capitulo: z.string().optional(),
  }),
}
```

`.extend()` preserva tipagem — o handler recebe `{ limit, offset, q?, capitulo? }`.

### `SearchQuery`

```ts
export const SearchQuery = z.object({
  q: z.string().min(2).optional().openapi({ description: 'Search term (min 2 chars)' }),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})
```

Usado em endpoints de autocomplete — `q` mínimo 2 chars, `limit` máximo 50.

### `listResponseSchema` — factory tipada

```ts
export function listResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: metaSchema(),
  })
}
```

Uso:

```ts
responses: {
  200: {
    content: {
      'application/json': { schema: listResponseSchema(DoencaSchema) },
    },
  },
}
```

O OpenAPI gerado vai incluir a estrutura completa (envelope + item).

### `ErrorSchema`

```ts
export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      status: z.number(),
    }),
  })
  .openapi('Error')
```

Reusado em todo 404/422/500 schema de response.

## Annotations `.openapi()`

Três formas:

### Nomear schema (aparece no Scalar)

```ts
const DoencaSchema = z.object({...}).openapi('Doenca')
```

Sem isso, o schema aparece "inlined" em cada rota. Com, vira referência `#/components/schemas/Doenca`.

### Exemplo

```ts
codigo: z.string().openapi({ example: 'A00' })
```

Scalar mostra `"A00"` como placeholder no "Try it".

### Descrição

```ts
q: z.string().optional().openapi({ description: 'Search by nome or codigo' })
```

Aparece como doc do parâmetro.

## Coerção — query string vs body

**Query string**: tudo vira string. Usar `z.coerce.*` pra converter:

```ts
limit: z.coerce.number().int().min(1).max(100).default(100)
id: z.coerce.number()
```

**Body JSON**: tipos já vêm certo. `z.number()` direto.

## Enums

```ts
tipo: z.enum(['imediata', 'semanal']).optional()
```

Aparece como `enum` no OpenAPI e o Scalar renderiza dropdown.

## Nullable vs optional

- `.optional()` — pode estar ausente (key não existe)
- `.nullable()` — pode ser `null` (key existe, valor null)

No banco: colunas `descricao text` (sem `NOT NULL`) → `z.string().nullable()` no schema.
No query string: parâmetros opcionais → `z.string().optional()`.

## Transformações

Normalizar input **antes** de usar:

```ts
// Uppercase códigos
const { codigo } = c.req.valid('param')
const upper = codigo.toUpperCase()
```

Evitar `z.transform()` pra isso — mais explícito no handler.

## Anti-padrões

- ❌ Declarar `interface Doenca {}` separado do schema Zod
- ❌ Usar `zod` direto em vez de `@hono/zod-openapi` (perde `.openapi()`)
- ❌ `z.any()` em response schema (Scalar não renderiza direito — usar tipo concreto ou `z.unknown()`)
- ❌ Schema com nome `.openapi('X')` duplicado em arquivos diferentes (OpenAPI fica inconsistente)

## Testes tipados de schema

Zod permite validar no teste:

```ts
const result = DoencaSchema.safeParse(body.data)
expect(result.success).toBe(true)
```

Útil pra garantir que handler não drifta do schema declarado.
