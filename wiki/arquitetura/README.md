# Arquitetura

Como o RefSUS é construído — estrutural e técnico. Decisões **isoladas** ficam em [`../adr/`](../adr/).

## Conteúdo

- [Visão geral](visao-geral.md) — o que a API faz, pra quem, diferenciais
- [Monorepo](monorepo.md) — estrutura pnpm workspaces
- [Deploy Cloudflare](deploy-cloudflare.md) — Workers + D1 + Pages
- [Diagramas](diagramas/) — C4, fluxo de dados _(planejado)_

## Stack atual

| Camada | Tech | Implementação |
|--------|------|---------------|
| API | Hono.js | ✅ |
| ORM | Drizzle | ✅ |
| Banco dev | SQLite (better-sqlite3) | ✅ |
| Banco prod | Cloudflare D1 | 🚧 em migração |
| Validação | Zod v4 | ✅ |
| Docs | Scalar (OpenAPI 3.1) | ✅ |
| Testes | Vitest | ✅ |
| Frontend | Astro.js | 🚧 estágio inicial |
| ETL | Python + pysus + DuckDB | 🔮 roadmap |
