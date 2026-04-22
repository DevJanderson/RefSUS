# RefSUS

API pública brasileira de dados de referência em saúde — CID-10, regiões IBGE, notificação compulsória — pra quem constrói software médico, clínico ou de pesquisa.

## Pra quem é

Desenvolvedor construindo prontuário, app de clínica, telemedicina, dashboard epidemiológico ou integração com dados de saúde no Brasil. Se o seu projeto precisa resolver "código CID-10 → nome da doença", "município IBGE → UF", "essa doença exige notificação?" — o RefSUS devolve isso em uma chamada HTTP, sem você precisar processar CSV, baixar arquivo `.dbc` ou lidar com token da API da OMS.

## O que está dentro

- **CID-10** — 2.045 doenças (tradução DATASUS, redistribuível) com capítulo, categoria, autocomplete e lookup por código
- **Sintomas** — 387 códigos CID-10 Capítulo XVIII (R00-R99)
- **Regiões IBGE** — 27 estados + 5.571 municípios com hierarquia (estado → cidades)
- **Notificação Compulsória** — 57 agravos (30 imediatas, 27 semanais) com mapeamento CID-10 ↔ SINAN
- **Fluxo de Notificação** — passos oficiais (imediata/semanal) com base legal e prazos
- **Estatísticas** — distribuição por capítulo CID-10, municípios por estado

## Começar em 30 segundos

```bash
git clone https://github.com/DevJanderson/RefSUS.git
cd RefSUS
pnpm install
pnpm dev:api
```

- API em http://localhost:8003
- Documentação interativa em http://localhost:8003/docs

## Estrutura

```
RefSUS/
├── packages/
│   ├── api/          # Hono.js — API REST + OpenAPI 3.1 + Scalar docs
│   └── web/          # Astro.js — frontend (em construção)
├── docs/             # documentação pública (pra quem consome a API)
├── wiki/             # documentação interna (pra quem contribui)
├── CLAUDE.md         # entry point pra agentes
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Hono.js (TypeScript) |
| ORM | Drizzle ORM |
| Banco (dev) | SQLite + better-sqlite3 |
| Banco (prod) | Cloudflare D1 |
| Validação | Zod v4 + @hono/zod-openapi |
| Docs interativa | Scalar (OpenAPI 3.1 auto-gerada) |
| Testes | Vitest |
| Lint | Biome |
| Monorepo | pnpm workspaces |
| Frontend | Astro.js |

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

Lista completa: [`docs/referencia/endpoints.md`](docs/referencia/endpoints.md).

## Documentação

### Pra **consumir** a API → [`docs/`](docs/README.md)

- [Início](docs/inicio/) — instalação, primeiros passos, conceitos
- [Guias](docs/guias/) — JavaScript, Python, verificar notificação, autocomplete
- [Referência](docs/referencia/) — endpoints, rate limiting, cache, erros
- Documentação interativa em [`/docs`](http://localhost:8003/docs) (Scalar)

### Pra **contribuir** → [`wiki/`](wiki/README.md)

- [Invariantes](wiki/INVARIANTES.md) — regras duras
- [Domínio](wiki/dominio/) — SUS, CID-10, base legal, glossário
- [Arquitetura](wiki/arquitetura/) — estrutura, monorepo, deploy
- [ADRs](wiki/adr/) — decisões arquiteturais
- [Dados](wiki/dados/) — data dictionary e fontes
- [Guias de dev](wiki/guias-dev/) — como adicionar endpoint, dataset, rodar testes
- [Runbooks](wiki/runbooks/) — rollback, reingestão, secrets
- [Roadmap](wiki/roadmap/) — 🔮 o que vem por aí

Agentes (Claude Code, Cursor, etc.): ler [`CLAUDE.md`](CLAUDE.md) primeiro.

## Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md). Antes de abrir PR, rode:

```bash
pnpm test && pnpm lint
```

## Deploy

Cloudflare Workers (API) + D1 (banco) + Pages (frontend). Custo: ~R$ 50/ano (domínio). Plano em [`wiki/arquitetura/deploy-cloudflare.md`](wiki/arquitetura/deploy-cloudflare.md).

## Licença

MIT
