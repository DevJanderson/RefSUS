# Rodar testes

## Stack

- **Vitest** pra todos os pacotes
- **SQLite em memória** pra testes de integração da API (não mockar)

## Comandos

```bash
pnpm test                     # todos os pacotes
pnpm --filter api test        # só api
pnpm --filter api test:watch  # watch mode
```

## Estrutura

`packages/api/tests/` — testes de integração (chamam handler Hono direto).

## Convenções

- Um arquivo por domínio: `doencas.test.ts`, `regioes.test.ts`
- `describe` por endpoint, `it` por caso
- Asserções claras e específicas (status, shape, conteúdo)
- Testar casos felizes **e** edge cases (404, 422, params inválidos)

## Exemplo

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../src/app'
import { seedTestDb } from './helpers'

describe('GET /v1/regioes/estados/:uf/municipios', () => {
  beforeAll(async () => {
    await seedTestDb()
  })

  it('retorna municípios de SP', async () => {
    const res = await app.request('/v1/regioes/estados/SP/municipios?limit=5')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.length).toBe(5)
    expect(body.meta.total).toBeGreaterThan(600)
  })

  it('retorna 404 pra UF inexistente', async () => {
    const res = await app.request('/v1/regioes/estados/XX/municipios')
    expect(res.status).toBe(404)
  })
})
```

## CI

GitHub Actions (`.github/workflows/test.yml`) roda em todo PR. Falhou → corrige antes de merge.

## Cobertura

_Ainda não configurada._ Reconsiderar quando volume crescer.
