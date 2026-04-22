# CLAUDE.md — packages/api

Contexto específico do pacote **api**. Lido por Claude Code quando o cwd é este diretório (cascata sobre o `CLAUDE.md` da raiz).

## Responsabilidade

Servir a API REST pública do RefSUS. Hoje em Hono.js (Node dev / Cloudflare Workers prod).

## Convenções locais

- **PT-BR** em rota, schema, coluna (ver [ADR 0003](../../wiki/adr/0003-ptbr-em-api-publica.md))
- **Envelope `{ data, meta }`** em toda lista
- **Zod primeiro**: schema define contrato, handler segue
- **Errors em PT-BR** com mensagem acionável

## Estrutura

```
packages/api/
├── src/
│   ├── index.ts          # entrypoint Node.js (dev)
│   ├── worker.ts         # entrypoint Cloudflare Workers (prod)
│   ├── app.ts            # composição Hono + registro de rotas
│   ├── env.ts            # parsing de env
│   ├── types.ts          # tipos compartilhados
│   ├── routes/
│   │   ├── doencas.ts    # /v1/doencas/*
│   │   ├── sintomas.ts   # /v1/sintomas/*
│   │   ├── regioes.ts    # /v1/regioes/*
│   │   ├── notificacao.ts# /v1/notificacao-compulsoria/*
│   │   ├── fluxo.ts      # /v1/fluxo-notificacao/*
│   │   ├── stats.ts      # /v1/stats
│   │   └── health.ts     # /health
│   ├── schemas/
│   │   └── shared.ts     # schemas Zod reutilizáveis (envelope, paginação)
│   ├── db/               # cliente Drizzle + queries
│   ├── seed/             # CSV → banco no startup
│   └── middleware/       # rate limit, cors, erros
├── data/                 # CSVs oficiais (fonte da verdade)
├── drizzle/              # config
├── migrations/           # SQL gerado pelo Drizzle Kit
├── scripts/              # geração de seed.sql pra D1
├── tests/                # Vitest
├── drizzle.config.ts
├── wrangler.toml         # config Cloudflare Workers
└── vitest.config.ts
```

## Fluxo dev

```bash
pnpm dev          # tsx watch em src/index.ts → http://localhost:8003
pnpm test         # Vitest
pnpm lint         # Biome
pnpm lint:fix     # Biome auto-fix
```

## Fluxo prod (Cloudflare)

```bash
pnpm deploy              # wrangler deploy
pnpm d1:migrate          # aplica migrations no D1
pnpm d1:seed:generate    # gera scripts/seed.sql
pnpm d1:seed             # roda seed no D1
```

## Antes de mexer em...

| Área | Leia |
|------|------|
| Rota nova | [`../../wiki/guias-dev/adicionar-endpoint.md`](../../wiki/guias-dev/adicionar-endpoint.md) |
| Schema Drizzle | [`../../wiki/dados/schema-banco.md`](../../wiki/dados/schema-banco.md) |
| CSV / seed | [`../../wiki/guias-dev/adicionar-dataset.md`](../../wiki/guias-dev/adicionar-dataset.md) |
| Deploy / wrangler.toml | [`../../wiki/arquitetura/deploy-cloudflare.md`](../../wiki/arquitetura/deploy-cloudflare.md) |
| Rate limit / middleware | `src/middleware/` + [`../../docs/referencia/rate-limiting.md`](../../docs/referencia/rate-limiting.md) |

## Regras específicas deste pacote

- `src/index.ts` (Node) e `src/worker.ts` (Workers) devem usar o **mesmo `app.ts`** — divergência é bug
- Qualquer código Node-only (ex: `better-sqlite3`, `fs`) fica atrás de abstração que o adapter Workers substitui
- `src/db/` exporta factory que recebe driver (better-sqlite3 OU D1) — nunca importar o driver direto nas rotas
- Testes usam SQLite em memória via `better-sqlite3` (`:memory:`), nunca mock

## O que NÃO fazer

- ❌ Importar `better-sqlite3` fora de `src/db/`
- ❌ Usar `process.env` direto em rotas — passa pelo context do Hono
- ❌ Retornar `res.json(array)` — sempre `res.json({ data: array, meta })`
- ❌ Adicionar handler sem schema Zod + OpenAPI
- ❌ Misturar lógica de domínio em middleware — middleware é transversal
