# Adicionar endpoint

## Passos

### 1. Entender o domínio

Antes de codar, confira se o conceito tem doc em [`../dominio/`](../dominio/). Se for endpoint de agravo, leia [`../dominio/notificacao-compulsoria.md`](../dominio/notificacao-compulsoria.md).

### 2. Definir schema Zod

Em `packages/api/src/schemas/` (ou no arquivo da rota se for local):

```ts
import { z } from 'zod'

export const DoencaSchema = z.object({
  codigo: z.string(),
  nome: z.string(),
  capitulo: z.string(),
  categoria: z.string(),
})

export const DoencaEnvelope = z.object({
  data: DoencaSchema,
})
```

Nomes de campos em PT-BR. Envelope `{ data, meta }` obrigatório.

### 3. Criar handler

`packages/api/src/routes/<dominio>.ts`:

```ts
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { DoencaEnvelope } from '../schemas/doencas'

const app = new OpenAPIHono()

const getPorCodigo = createRoute({
  method: 'get',
  path: '/codigo/{codigo}',
  request: { params: z.object({ codigo: z.string() }) },
  responses: {
    200: { content: { 'application/json': { schema: DoencaEnvelope } }, description: 'Doença encontrada' },
    404: { description: 'Código não encontrado' },
  },
})

app.openapi(getPorCodigo, async (c) => {
  const { codigo } = c.req.valid('param')
  // ... lookup no db
  return c.json({ data: doenca }, 200)
})

export default app
```

### 4. Registrar em `app.ts`

```ts
app.route('/v1/doencas', doencasRoute)
```

### 5. Escrever testes

`packages/api/tests/doencas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { app } from '../src/app'

describe('GET /v1/doencas/codigo/:codigo', () => {
  it('retorna doença existente', async () => {
    const res = await app.request('/v1/doencas/codigo/A90')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.codigo).toBe('A90')
  })
})
```

### 6. Validar

```bash
pnpm --filter api test
pnpm --filter api lint
```

### 7. Atualizar docs públicas

Se o endpoint é público, atualize [`../../docs/referencia/endpoints.md`](../../docs/referencia/endpoints.md).

## Checklist antes de commit

- [ ] Schema Zod definido
- [ ] Testes passam
- [ ] Biome sem reclamação
- [ ] `/docs` renderiza a rota sem erro (abra no browser)
- [ ] PT-BR em rota/campos/mensagens
- [ ] Envelope `{ data, meta }` respeitado
- [ ] `docs/referencia/endpoints.md` atualizado
