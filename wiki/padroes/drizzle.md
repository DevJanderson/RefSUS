# Drizzle — padrões de query

Extraído de `packages/api/src/db/schema.ts` e rotas.

## Schema de tabela

```ts
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const doencas = sqliteTable(
  'doencas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    codigo: text('codigo').notNull().unique(),
    nome: text('nome').notNull(),
    descricao: text('descricao'),           // nullable
    capitulo: text('capitulo'),
    categoria: text('categoria'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('idx_doencas_codigo').on(table.codigo)],
)
```

### Convenções

- **Nome da tabela em snake_case PT-BR**: `doencas`, `notificacao_compulsoria`, `notificacao_cid`
- **Nome da coluna em snake_case PT-BR** no SQL, **camelCase** no TS — Drizzle mapeia (`codigoIbge` ↔ `codigo_ibge`)
- **PK surrogate `id`** (`integer primaryKey autoIncrement`) + **unique** no código natural (`codigo`, `codigo_ibge`)
- **Índice em toda coluna que vai no WHERE** frequente — especialmente lookups por código
- **`createdAt` / `updatedAt`** em toda tabela principal, `text` ISO 8601 via `$defaultFn`

## Relacionamento N:N

`notificacao_cid` é tabela de junção entre `notificacao_compulsoria` e CID-10 (texto solto, não FK pra `doencas`):

```ts
export const notificacaoCid = sqliteTable(
  'notificacao_cid',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    notificacaoId: integer('notificacao_id')
      .notNull()
      .references(() => notificacaoCompulsoria.id),
    codigoCid: text('codigo_cid').notNull(),
  },
  (table) => [
    index('idx_nc_cid_codigo').on(table.codigoCid),
    index('idx_nc_cid_notificacao').on(table.notificacaoId),
  ],
)
```

**Índice nas duas colunas de join** — cobre consulta por agravo e por CID.

## SELECT

### Padrão básico

```ts
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { doencas } from '../db/schema'

const rows = await db.select().from(doencas).where(eq(doencas.codigo, 'A00'))
```

### Select de shape específico (select fields)

```ts
const selectFields = {
  id: doencas.id,
  codigo: doencas.codigo,
  nome: doencas.nome,
}

await db.select(selectFields).from(doencas)
```

Mais performático que `select()` completo quando você não precisa de todas as colunas. E tipagem fica exata.

### Primeira linha (lookup)

```ts
const [row] = await db.select(selectFields).from(doencas).where(eq(doencas.codigo, codigo))
if (!row) return c.json({ error: {...} }, 404)
```

`.limit(1)` é implícito quando você destructura `[row]`. Mas pra queries grandes, adicione `.limit(1)` explícito pra garantir.

## Conditions dinâmicas

Padrão do projeto — array de `SQL[]`:

```ts
import { and, eq, like, or, type SQL } from 'drizzle-orm'

const conditions: SQL[] = []
if (q) conditions.push(or(like(doencas.nome, `%${q}%`), like(doencas.codigo, `%${q}%`))!)
if (capitulo) conditions.push(eq(doencas.capitulo, capitulo))
if (categoria) conditions.push(eq(doencas.categoria, categoria))

const where = conditions.length > 0 ? and(...conditions) : undefined
await db.select().from(doencas).where(where)
```

`where(undefined)` = sem filtro.

## Paginação + count em paralelo

```ts
import { count } from 'drizzle-orm'

const [data, [{ total }]] = await Promise.all([
  db.select(selectFields).from(doencas).where(where).limit(limit).offset(offset),
  db.select({ total: count() }).from(doencas).where(where),
])
```

Duas queries em paralelo. `count()` com mesmo WHERE pra total correto.

## Facets (distinct)

```ts
const rows = await db
  .selectDistinct({ capitulo: doencas.capitulo })
  .from(doencas)
  .orderBy(doencas.capitulo)

return c.json({
  data: rows.map(r => r.capitulo).filter((v): v is string => v !== null),
})
```

Filter com type guard pra remover nulls mantendo TS happy.

## Joins

```ts
const matches = await db
  .select({
    agravo: notificacaoCompulsoria.agravo,
    tipoNotificacao: notificacaoCompulsoria.tipoNotificacao,
  })
  .from(notificacaoCid)
  .innerJoin(
    notificacaoCompulsoria,
    eq(notificacaoCid.notificacaoId, notificacaoCompulsoria.id),
  )
  .where(eq(notificacaoCid.codigoCid, upper))
```

**Use join em vez de N+1.** Exemplo ruim que já tem no código (`routes/notificacao.ts` linha 63):

```ts
// ⚠️ N+1 — pra cada agravo, um query pros CIDs
const data = await Promise.all(
  agravos.map(async (a) => {
    const cids = await db.select({ codigo: notificacaoCid.codigoCid })
      .from(notificacaoCid)
      .where(eq(notificacaoCid.notificacaoId, a.id))
    return { ...a, codigosCid: cids.map(c => c.codigo) }
  }),
)
```

Isso funciona pra 57 agravos (volume baixo), mas **não é o padrão**. Pra datasets maiores, fazer LEFT JOIN + group no application:

```ts
// ✅ Uma query só
const rows = await db
  .select({
    id: notificacaoCompulsoria.id,
    agravo: notificacaoCompulsoria.agravo,
    tipoNotificacao: notificacaoCompulsoria.tipoNotificacao,
    codigoCid: notificacaoCid.codigoCid,
  })
  .from(notificacaoCompulsoria)
  .leftJoin(notificacaoCid, eq(notificacaoCid.notificacaoId, notificacaoCompulsoria.id))

// Agrupar em app
const byAgravo = Object.values(
  rows.reduce((acc, r) => {
    if (!acc[r.id]) acc[r.id] = { ...r, codigosCid: [] }
    if (r.codigoCid) acc[r.id].codigosCid.push(r.codigoCid)
    return acc
  }, {} as Record<number, any>),
)
```

TODO no código: refatorar `routes/notificacao.ts` pra usar join quando virar gargalo.

## LIKE e busca

```ts
like(doencas.nome, `%${q}%`)
```

Case-sensitive por padrão em SQLite. Pra case-insensitive:

```ts
import { sql } from 'drizzle-orm'
sql`lower(${doencas.nome}) LIKE lower(${`%${q}%`})`
```

**Mas cuidado**: `LOWER(col)` não usa índice. Melhor **normalizar na inserção** (guardar coluna `nome_lower`) se busca insensitive for frequente.

## Transactions

```ts
await db.transaction(async (tx) => {
  const [agravo] = await tx.insert(notificacaoCompulsoria).values({...}).returning()
  await tx.insert(notificacaoCid).values(cids.map(c => ({ notificacaoId: agravo.id, codigoCid: c })))
})
```

Rollback automático se lançar exception dentro. **D1 tem suporte limitado a transactions** — checar antes de usar em prod.

## Prepared statements

Drizzle suporta, mas o projeto **não usa ainda**. Vale quando a mesma query roda centenas de vezes por request (raro no RefSUS, que é data-heavy em lookup único).

## Anti-padrões

- ❌ Concatenar string em `sql\`\``: usar parâmetros (`sql\`... = ${value}\``)
- ❌ N+1: loop que faz query por item — fazer join
- ❌ `.all()` sem limit em query de lista pública
- ❌ `SELECT *` quando só precisa de 3 colunas
- ❌ WHERE em coluna sem índice em query quente
