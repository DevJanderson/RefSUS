# Monorepo

## Estrutura pnpm workspaces

```
RefSUS/
├── pnpm-workspace.yaml    # declara packages/*
├── package.json           # scripts raiz (dev, test, lint, build)
└── packages/
    ├── api/               # Hono.js API
    └── web/               # Astro.js frontend
```

## Scripts da raiz

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Sobe todos os pacotes (api + web) em paralelo |
| `pnpm dev:api` | Só api |
| `pnpm dev:web` | Só web |
| `pnpm test` | Vitest em todos os pacotes |
| `pnpm lint` | Biome em todos os pacotes |
| `pnpm build` | Build de todos os pacotes |

Usam `pnpm -r` (recursive) e `pnpm --filter`.

## Por que monorepo

Ver [ADR 0001](../adr/0001-monorepo-pnpm.md).

## Adicionar pacote novo

1. Criar pasta em `packages/<nome>/`
2. `packages/<nome>/package.json` com `"name": "<nome>"` e scripts `dev`, `test`, `lint`, `build`
3. Rodar `pnpm install` na raiz — pnpm detecta automaticamente
4. Adicionar `packages/<nome>/CLAUDE.md` documentando convenções do pacote
5. Atualizar [`../../CLAUDE.md`](../../CLAUDE.md) (raiz) com o pacote novo

## Pacotes futuros possíveis (🔮)

- `packages/sdk` — cliente TS tipado gerado do OpenAPI
- `packages/cli` — CLI pra consultas locais
- `packages/etl` — pipeline Python de dados epidemiológicos
- `packages/shared` — tipos e utils compartilhados
