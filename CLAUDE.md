# CLAUDE.md — RefSUS

Entry point pra Claude Code (e outros agentes). Leia isto **antes** de qualquer mudança. Tudo aqui é curto de propósito — detalhe mora na [`wiki/`](wiki/README.md).

## O que é o RefSUS

API pública de dados de referência do SUS (CID-10, IBGE, notificação compulsória). Monorepo pnpm com dois pacotes:

- [`packages/api`](packages/api/CLAUDE.md) — Hono.js + Drizzle + SQLite (dev) / Cloudflare Workers + D1 (prod)
- [`packages/web`](packages/web/CLAUDE.md) — Astro.js (frontend, 🚧 estágio inicial)

Contexto completo: [`wiki/arquitetura/visao-geral.md`](wiki/arquitetura/visao-geral.md).

## Regras invioláveis

**Leia sempre primeiro:** [`wiki/INVARIANTES.md`](wiki/INVARIANTES.md). Sumário:

- **Nomes em PT-BR** em endpoints, tabelas, colunas — é convenção deliberada ([ADR 0003](wiki/adr/0003-ptbr-em-api-publica.md)). Não "corrigir".
- **Toda resposta de lista** usa envelope `{ data, meta }`.
- **Dado epidemiológico** (quando existir) exige `meta.fonte` + `meta.dataReferencia`.
- **Nenhum dado entra sem rastreabilidade até a fonte oficial.**
- **Mudança em schema Zod/Drizzle** exige Vitest passando antes de commit.
- Docs em [`wiki/roadmap/`](wiki/roadmap/) são **🔮 futuros** — não implementar sem discutir.

## Como rodar

```bash
pnpm install          # raiz do monorepo
pnpm dev              # sobe api + web
pnpm dev:api          # só api → http://localhost:8003 (docs em /docs)
pnpm dev:web          # só frontend Astro
pnpm test             # Vitest em todos os pacotes
pnpm lint             # Biome em todos os pacotes
```

## Mapa de documentação

| Pasta | Pra quem | O que contém |
|-------|----------|--------------|
| [`docs/`](docs/README.md) | **Consumidor da API** | Guias públicos, referência, tutoriais |
| [`wiki/`](wiki/README.md) | **Contribuidor e agente** | Domínio, arquitetura, ADRs, runbooks |
| [`packages/*/CLAUDE.md`](packages/api/CLAUDE.md) | **Agente dentro do pacote** | Convenções específicas |

## Mapa — área → onde ler antes de mexer

| Se vai mexer em... | Leia antes |
|--------------------|------------|
| Rota nova / existente | [`wiki/guias-dev/adicionar-endpoint.md`](wiki/guias-dev/adicionar-endpoint.md) + `packages/api/src/routes/` |
| Notificação compulsória / agravos | [`wiki/dominio/notificacao-compulsoria.md`](wiki/dominio/notificacao-compulsoria.md) |
| CID-10 | [`wiki/dominio/cid10.md`](wiki/dominio/cid10.md) |
| CSVs, seeds, ingestão | [`wiki/guias-dev/adicionar-dataset.md`](wiki/guias-dev/adicionar-dataset.md) + [`wiki/dados/fontes-oficiais.md`](wiki/dados/fontes-oficiais.md) |
| Schema do banco / Drizzle | [`wiki/dados/schema-banco.md`](wiki/dados/schema-banco.md) + `packages/api/src/db/` |
| Deploy / Cloudflare / D1 | [`wiki/arquitetura/deploy-cloudflare.md`](wiki/arquitetura/deploy-cloudflare.md) + [`wiki/guias-dev/fazer-deploy.md`](wiki/guias-dev/fazer-deploy.md) |
| Testes | [`wiki/guias-dev/rodar-testes.md`](wiki/guias-dev/rodar-testes.md) |
| ETL / dados epidemiológicos | [`wiki/roadmap/integracao-dados-vivos.md`](wiki/roadmap/integracao-dados-vivos.md) (🔮 futuro) |
| Volume / custos / free tier | [`wiki/roadmap/volume-e-validacao.md`](wiki/roadmap/volume-e-validacao.md) (🔮 futuro) |
| Base legal / portarias | [`wiki/dominio/base-legal.md`](wiki/dominio/base-legal.md) |
| Decisão arquitetural | [`wiki/adr/`](wiki/adr/README.md) |
| Operação / incidentes | [`wiki/runbooks/`](wiki/runbooks/README.md) |

## Stack atual

| Camada | Tech | Status |
|--------|------|--------|
| API | Hono.js + `@hono/zod-openapi` | ✅ |
| ORM | Drizzle ORM | ✅ |
| Banco dev | better-sqlite3 | ✅ |
| Banco prod | Cloudflare D1 | 🚧 em migração |
| Docs | Scalar (OpenAPI 3.1) | ✅ |
| Validação | Zod v4 | ✅ |
| Testes | Vitest | ✅ |
| Lint/Format | Biome | ✅ |
| Monorepo | pnpm workspaces ([ADR 0001](wiki/adr/0001-monorepo-pnpm.md)) | ✅ |
| Frontend | Astro.js | 🚧 inicial |
| ETL | Python + pysus | 🔮 roadmap |

## Golden paths

### Adicionar endpoint novo

Guia completo em [`wiki/guias-dev/adicionar-endpoint.md`](wiki/guias-dev/adicionar-endpoint.md). Resumo:

1. Schema Zod em `packages/api/src/schemas/`
2. Handler em `packages/api/src/routes/<dominio>.ts`
3. Registro em `src/app.ts`
4. Testes em `packages/api/tests/`
5. `pnpm --filter api test` + `lint` passam
6. Atualizar [`docs/referencia/endpoints.md`](docs/referencia/endpoints.md)

### Adicionar dataset novo

Guia completo em [`wiki/guias-dev/adicionar-dataset.md`](wiki/guias-dev/adicionar-dataset.md). Resumo:

1. CSV em `packages/api/data/` com cabeçalho PT-BR
2. Fonte documentada em [`wiki/dados/fontes-oficiais.md`](wiki/dados/fontes-oficiais.md)
3. Schema Drizzle + migration + seed
4. Atualizar [`wiki/dados/schema-banco.md`](wiki/dados/schema-banco.md) e [`wiki/dados/changelog-dados.md`](wiki/dados/changelog-dados.md)

### Tomar decisão arquitetural

Nova decisão não-óbvia → copiar [`wiki/adr/template.md`](wiki/adr/template.md), incrementar número, escrever.

## O que NÃO fazer

- ❌ Criar endpoint em inglês (`/diseases`, `/regions`) — é `/doencas`, `/regioes` ([ADR 0003](wiki/adr/0003-ptbr-em-api-publica.md))
- ❌ Mockar banco em teste de integração — usa SQLite em memória
- ❌ Retornar array cru — sempre `{ data, meta }`
- ❌ Adicionar dependência Python no monorepo atual (ETL é 🔮 futuro, discussão antes)
- ❌ Commitar com testes falhando ou Biome reclamando
- ❌ Editar CSVs de `packages/api/data/` sem atualizar [`wiki/dados/fontes-oficiais.md`](wiki/dados/fontes-oficiais.md)
- ❌ Implementar algo de [`wiki/roadmap/`](wiki/roadmap/) sem confirmar que virou prioridade

## Quando atualizar esta doc

- Mudou convenção global
- Adicionou pacote novo no monorepo
- Regra nova inviolável → adicione em [`wiki/INVARIANTES.md`](wiki/INVARIANTES.md), referencie aqui
- Mudou entrada do "mapa área → doc"

## Convenções de commit

- PT-BR, imperativo curto: `adiciona endpoint /sintomas/autocomplete`
- Sem co-author automático
- Um PR = uma mudança lógica (refactor + feature em PRs separados)

## Referências cruzadas

- [`AGENTS.md`](AGENTS.md) — stub pra agentes que procuram esse nome
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — pro humano contribuidor
- [`CHANGELOG.md`](CHANGELOG.md) — mudanças user-facing
