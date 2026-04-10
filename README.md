# RefSUS

API pública de dados de referência do SUS para saúde coletiva no Brasil.

## O que é

RefSUS unifica as bases de dados que todo profissional de vigilância epidemiológica usa diariamente:

- **CID-10** — 2.045 doenças com capítulo, categoria, autocomplete e lookup por código
- **Sintomas** — 387 códigos CID-10 Capítulo XVIII (R00-R99)
- **Regiões IBGE** — 27 estados + 5.571 municípios com hierarquia (estado → cidades)
- **Notificação Compulsória** — 57 agravos (30 imediatas, 27 semanais) com mapeamento CID-10 ↔ SINAN
- **Fluxo de Notificação** — passos oficiais (imediata/semanal) com base legal e prazos
- **Estatísticas** — distribuição por capítulo CID-10, municípios por estado

## Estrutura

```
RefSUS/
├── packages/
│   ├── api/          ← Hono.js — API REST + OpenAPI 3.1 + Scalar docs
│   └── web/          ← Astro.js — frontend (planejado)
├── wiki/             ← documentação do projeto
└── pnpm-workspace.yaml
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Hono.js (TypeScript) |
| ORM | Drizzle ORM |
| Banco (dev) | SQLite + better-sqlite3 |
| Validação | Zod v4 + @hono/zod-openapi |
| Docs | Scalar (OpenAPI 3.1 auto-gerada) |
| Testes | Vitest (22 testes) |
| Lint | Biome |
| Monorepo | pnpm workspaces |

## Começar

```bash
pnpm install
pnpm dev
# → http://localhost:8003
# → http://localhost:8003/docs
```

## Endpoints principais

| Rota | O que faz |
|------|-----------|
| `GET /v1/doencas?q=dengue` | Busca doenças por nome ou código |
| `GET /v1/doencas/codigo/A90` | Lookup direto por CID-10 |
| `GET /v1/doencas/autocomplete?q=col` | Typeahead leve |
| `GET /v1/notificacao-compulsoria/verificar/A90` | Verifica se precisa notificar |
| `GET /v1/fluxo-notificacao/imediata` | Passos oficiais com base legal |
| `GET /v1/regioes/estados/SP/municipios` | Cidades de um estado |
| `GET /v1/stats` | Overview dos dados |
| `GET /docs` | Documentação interativa (Scalar) |

Documentação completa em `/docs` (gerada automaticamente dos schemas).

## Wiki

- [Visão Geral](wiki/visao-geral.md)
- [Notificação Compulsória](wiki/notificacao-compulsoria.md)
- [Dados e Fontes](wiki/dados-e-fontes.md)
- [Guia de Uso](wiki/guia-de-uso.md)
- [Integração Epidemiológica](wiki/integracao-dados-vivos.md)
- [Volume e Validação](wiki/volume-e-validacao.md)
- [Plano de Deploy](wiki/plano-deploy-cloudflare.md)

## Deploy planejado

Cloudflare Workers (API) + D1 (banco) + Pages (frontend Astro.js). Custo: ~R$ 50/ano (domínio).

## Licença

MIT
