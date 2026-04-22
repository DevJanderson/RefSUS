# Schema do banco

## Tabelas atuais

Definições canônicas em `packages/api/src/db/` (Drizzle).

| Tabela | O que armazena | CSV fonte |
|--------|----------------|-----------|
| `doencas` | 2.045 códigos CID-10 | `data/doencas.csv` |
| `sintomas` | 387 códigos R00-R99 | `data/sintomas.csv` |
| `regioes` | 27 estados + 5.571 municípios | `data/regioes.csv` |
| `agravos` | 57 agravos de notificação | `data/notificacao_compulsoria.csv` |
| `agravo_cid` | Relação N:N agravo ↔ CID | derivada |

## Colunas principais

### `doencas`
- `codigo` (PK) — CID-10 (`A00`, `A01`, ...)
- `nome`
- `capitulo`
- `categoria`

### `regioes`
- `codigo_ibge` (PK)
- `nome`
- `tipo` — `estado` | `municipio`
- `uf`
- `estado` — nome por extenso

### `agravos`
- `id` (PK)
- `nome` — "Dengue", "Cólera"
- `tipo_notificacao` — `imediata` | `semanal`

### `agravo_cid`
- `agravo_id` (FK)
- `codigo_cid` (FK)

## Índices

Definidos em migrations (`packages/api/migrations/`).

## Evolução

- Mudanças via Drizzle Kit: `pnpm --filter api db:generate`
- Aplicar dev: `pnpm --filter api db:migrate`
- Aplicar prod (D1): `pnpm --filter api d1:migrate`

## Regras

- Toda tabela nova precisa de CSV fonte em `packages/api/data/` **ou** gerada derivada com seed comentando origem
- PK natural (código) onde existe; surrogate `id` só quando necessário
- Nomes em PT-BR (ver [INVARIANTES](../INVARIANTES.md))
