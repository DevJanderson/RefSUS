# Testes — Vitest + SQLite em memória

Extraído de [`tests/doencas.test.ts`](../../packages/api/tests/doencas.test.ts) e [`db/test-db.ts`](../../packages/api/src/db/test-db.ts).

## Princípio

Testes de integração usam **SQLite `:memory:`**, não mock. Divergência mock/prod esconde bugs de migration — ver [INVARIANTES](../INVARIANTES.md).

## Setup — `createTestDb()`

```ts
// src/db/test-db.ts
import Database from 'better-sqlite3'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function createTestDb() {
  const sqlite = new Database(':memory:')
  const testDb = drizzle(sqlite, { schema })

  // Criar tabelas via SQL direto (mais simples que rodar migrate)
  testDb.run(sql`CREATE TABLE doencas (...)`)
  testDb.run(sql`CREATE INDEX idx_doencas_codigo ON doencas(codigo)`)
  // ... demais tabelas

  return testDb
}
```

**Por que SQL direto e não Drizzle migrate?**
- Migrações têm overhead de I/O (lê arquivos)
- `:memory:` zera a cada teste — precisa ser rápido
- SQL de tabela é estável, raramente muda junto com teste

**Quando o schema mudar:** atualize `test-db.ts` na mesma PR. É fricção pequena que compensa o isolamento.

## Estrutura de arquivo

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { doencas } from '../src/db/schema'
import { createTestDb } from '../src/db/test-db'

function seedDoencas(db: ReturnType<typeof createTestDb>) {
  const data = [
    { codigo: 'A00', nome: 'Cólera', ... },
    // fixture pequeno e legível
  ]
  for (const d of data) db.insert(doencas).values(d).run()
}

function createApp() {
  const db = createTestDb()
  seedDoencas(db)
  // ... monta app com db isolado
  return app
}

describe('Doenças (CID-10)', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    app = createApp()   // app novo por teste — sem leak de estado
  })

  describe('GET /', () => {
    it('lists all diseases', async () => {
      const res = await app.request('/')
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body).toHaveLength(5)
    })
  })
})
```

## `app.request` — sem HTTP real

```ts
const res = await app.request('/doencas/codigo/A00')
const body = await res.json()
expect(res.status).toBe(200)
expect(body.data.codigo).toBe('A00')
```

- Não sobe servidor — Hono executa a rota direto
- Rápido (centenas de testes em segundos)
- Suporta query, params, body, headers

### Query string

```ts
await app.request('/doencas?q=Colera&limit=5')
await app.request(`/doencas?capitulo=${encodeURIComponent('X - Respiratórias')}`)
```

### POST / body

```ts
const res = await app.request('/doencas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ codigo: 'Z00', nome: 'Teste' }),
})
```

## Gap importante — teste duplica a rota

**O código atual tem um problema:** `tests/doencas.test.ts` **recria a rota dentro do teste** em vez de importar do código real:

```ts
// ❌ Hoje
function createApp() {
  const db = createTestDb()
  seedDoencas(db)
  const app = new OpenAPIHono()
  app.openapi(createRoute({...}), async (c) => {
    // lógica reescrita aqui!
  })
  return app
}
```

Isso testa a **estrutura** mas não o **handler real**. Se `src/routes/doencas.ts` mudar comportamento, o teste continua passando.

### Padrão correto (a migrar)

Rotas precisam aceitar `db` injetado pra serem testáveis:

```ts
// src/routes/doencas.ts — refatoração pendente
export function createDoencasRoute(db: AppDb) {
  const app = new OpenAPIHono()
  // ... usa `db` parâmetro em vez de importar global
  return app
}
```

E teste importa a rota real:

```ts
// tests/doencas.test.ts — ideal
import { createDoencasRoute } from '../src/routes/doencas'
import { createTestDb } from '../src/db/test-db'

function setupApp() {
  const db = createTestDb()
  seedDoencas(db)
  const app = new OpenAPIHono()
  app.route('/', createDoencasRoute(db))
  return app
}
```

**Tradeoff:** refatoração toca todas as rotas. Fazer em um só PR, com todos os testes atualizados. Ver issue GitHub (a criar).

Alternativa mais simples: usar o **proxy `db`** que o projeto já tem (`src/db/index.ts`) — chamar `setDb(testDb)` antes do teste e importar `app` real. Menos refactor.

## Convenções de teste

- **Um arquivo por domínio** — `doencas.test.ts`, `regioes.test.ts`
- **`describe` por rota** — `GET /`, `GET /:id`
- **`it` por caso** — caso feliz, filtros, 404, 422, edge cases
- **`beforeEach` pra isolamento** — nunca depender de estado entre testes
- **Fixtures mínimos** — 5 registros costumam chegar; não copia o dataset todo
- **Asserções específicas** — `toHaveLength(2)` + `body[0].codigo === 'A01'`, não só `toBeDefined()`

## Watch mode

```bash
pnpm --filter api test:watch
```

Vitest re-roda só o que mudou. Usar durante dev.

## Cobertura — ainda não configurada

Quando a base crescer, adicionar:

```bash
pnpm --filter api test -- --coverage
```

Vitest suporta nativo via `c8`. Configurar `vitest.config.ts` com threshold mínimo (ex: 80%) — mas só depois que os testes forem refatorados pra cobrir handlers reais.

## Testes que FALTAM

Gap conhecido (referência pra issues):

- `notificacao.test.ts` — nenhum teste da lógica mais complexa da API
- `fluxo.test.ts` — nenhum
- `stats.test.ts` — nenhum
- Testes de middleware isolado (requestId, errorHandler)
- Testes de schema Zod (validação de inputs maliciosos)

## Anti-padrões

- ❌ Mock do `db` — usa `:memory:` SQLite
- ❌ Seed compartilhado entre testes (`beforeAll`) — gera flakiness
- ❌ Depender de ordem de execução de `it`s
- ❌ Testar com dataset completo (2.045 doenças) — fixture pequeno basta
- ❌ Asserção só de status (`expect(res.status).toBe(200)`) — validar shape/conteúdo também
