# Setup local

## Requisitos

- Node.js 20+
- pnpm 10+
- Git

## Passos

```bash
git clone git@github.com:DevJanderson/RefSUS.git
cd RefSUS
pnpm install
pnpm dev:api
```

API em http://localhost:8003, docs em http://localhost:8003/docs.

Primeiro start roda seed do SQLite automaticamente (CSVs de `packages/api/data/` → `packages/api/data/referencia.db`).

## Resetar banco

```bash
rm packages/api/data/referencia.db
pnpm dev:api
```

## Editor

Recomendado VS Code com:
- Biome (format/lint)
- SQLite Viewer (inspecionar `.db`)

## Variáveis de ambiente

Dev não exige `.env`. Prod usa `wrangler.toml` + Workers secrets — ver [`fazer-deploy.md`](fazer-deploy.md).
