# Adicionar dataset

## Pré-requisito

**Fonte oficial identificada.** Sem fonte rastreável, não entra (ver [INVARIANTES](../INVARIANTES.md)).

## Passos

### 1. Documentar fonte

Adicione linha em [`../dados/fontes-oficiais.md`](../dados/fontes-oficiais.md) com:
- Nome do dataset
- URL oficial
- Data de referência
- Licença (se aplicável)

### 2. Adicionar CSV

Em `packages/api/data/<dataset>.csv`. Convenções:
- UTF-8
- Cabeçalho em PT-BR snake_case (`codigo_ibge`, não `codigo-ibge` nem `codigoIbge`)
- Separador vírgula
- Encoding explícito

### 3. Definir schema Drizzle

Em `packages/api/src/db/` (ver padrão nos arquivos existentes):

```ts
export const meuDataset = sqliteTable('meu_dataset', {
  codigo: text('codigo').primaryKey(),
  nome: text('nome').notNull(),
})
```

### 4. Gerar migration

```bash
pnpm --filter api db:generate
```

Revise o SQL gerado em `packages/api/migrations/` antes de aplicar.

### 5. Criar seed

Em `packages/api/src/seed/`, ler o CSV e inserir. Use `csv-parse` (já instalado).

### 6. Aplicar

```bash
pnpm --filter api db:migrate   # aplica schema
pnpm dev:api                   # seed roda automático se tabela vazia
```

### 7. Atualizar changelog de dados

[`../dados/changelog-dados.md`](../dados/changelog-dados.md) com data e fonte.

### 8. Atualizar data dictionary

[`../dados/schema-banco.md`](../dados/schema-banco.md) com a nova tabela.

## Checklist

- [ ] CSV em `packages/api/data/`
- [ ] Fonte documentada em `fontes-oficiais.md`
- [ ] Schema Drizzle criado
- [ ] Migration revisada
- [ ] Seed funciona em banco limpo
- [ ] `changelog-dados.md` atualizado
- [ ] `schema-banco.md` atualizado
- [ ] Testes cobrem nova tabela
