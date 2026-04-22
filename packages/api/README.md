# packages/api

API REST do RefSUS em Hono.js.

## Rodar

```bash
pnpm install      # na raiz do monorepo
pnpm --filter api dev
# → http://localhost:8003
# → http://localhost:8003/docs
```

## Stack

- Hono.js + `@hono/zod-openapi`
- Drizzle ORM
- better-sqlite3 (dev) / Cloudflare D1 (prod)
- Zod v4
- Vitest
- Biome

## Scripts

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Sobe em http://localhost:8003 com hot reload |
| `pnpm dev:worker` | Simula Cloudflare Workers localmente (wrangler dev) |
| `pnpm test` | Vitest |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm db:generate` | Gera migration Drizzle |
| `pnpm db:migrate` | Aplica migration dev |
| `pnpm d1:migrate` | Aplica migration no Cloudflare D1 |
| `pnpm d1:seed:generate` | Gera SQL de seed a partir dos CSVs |
| `pnpm d1:seed` | Roda seed no D1 |
| `pnpm deploy` | Deploy pra Cloudflare Workers |
| `pnpm build` | Build TypeScript |

## Docs

- Pública (pra consumidor): [`../../docs/`](../../docs/)
- Convenções internas: [`CLAUDE.md`](CLAUDE.md)
- Contribuição: [`../../wiki/guias-dev/`](../../wiki/guias-dev/)
