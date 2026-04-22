# RefSUS — Plano de Deploy (Cloudflare + Astro.js)

## Arquitetura

```
refsus.dev (Cloudflare)
│
├── /                    → Astro.js (Cloudflare Pages) — frontend
│   ├── Busca CID-10 com autocomplete
│   ├── Verificação de notificação compulsória
│   ├── Dashboard de estatísticas
│   ├── Mapa de regiões
│   └── Fluxo de notificação visual (passo a passo)
│
├── /api/*               → Hono.js (Cloudflare Workers) — API
│   ├── /api/v1/doencas
│   ├── /api/v1/sintomas
│   ├── /api/v1/regioes
│   ├── /api/v1/notificacao-compulsoria
│   ├── /api/v1/fluxo-notificacao
│   └── /api/v1/stats
│
├── /api/docs            → Scalar — documentação interativa
├── /api/openapi.json    → Spec OpenAPI 3.1
│
└── D1                   → Cloudflare D1 (SQLite na edge) — banco
```

## Serviços Cloudflare (tudo free tier)

| Serviço | O que faz | Free tier |
|---------|-----------|-----------|
| **Workers** | Roda a API Hono.js na edge | 100k requests/dia |
| **D1** | Banco SQLite distribuído | 5 GB, 5M leituras/dia, 100k escritas/dia |
| **Pages** | Hospeda o frontend Astro.js | Sites ilimitados, builds ilimitados |
| **Registrar** | Registra o domínio | ~$10/ano (.com), ~$8/ano (.dev) |
| **DNS** | Gerencia domínio | Free |
| **SSL/HTTPS** | Certificado automático | Free |
| **CDN** | Cache global | Free |

**Custo total estimado: ~R$ 50/ano** (só o domínio).

## Desenvolvimento local → produção

### Fase 1: Localhost (atual)

O que já temos funcionando:
- API Hono.js em `localhost:8003`
- SQLite local com better-sqlite3
- Scalar docs em `localhost:8003/docs`
- 22 testes passando

### Fase 2: Migrar API pra Cloudflare Workers + D1

O que muda no código:

| De (Node.js) | Para (Cloudflare Workers) |
|-------------|--------------------------|
| `@hono/node-server` | `hono/cloudflare-workers` (adapter built-in) |
| `better-sqlite3` | `drizzle-orm/d1` (Cloudflare D1 driver) |
| `serve({ port: 8003 })` | `export default app` (Workers entry point) |
| `.env` file | `wrangler.toml` + Workers secrets |

A lógica das rotas, schemas, validação — tudo permanece idêntico. Só muda o adapter de entrada e o driver do banco.

Estrutura do `wrangler.toml`:
```toml
name = "refsus-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "refsus"
database_id = "auto-generated"
```

### Fase 3: Frontend Astro.js no Cloudflare Pages

Stack do frontend:
- **Astro.js** — framework (estático por padrão, rápido, SEO)
- **Islands architecture** — JavaScript só onde precisa (autocomplete, gráficos)
- **Tailwind CSS** — estilização
- **Chart.js ou Recharts** — gráficos de estatísticas
- **Leaflet** — mapa de regiões (se necessário)

Páginas do frontend:

| Página | O que mostra |
|--------|-------------|
| `/` | Landing page — o que é a API, como usar |
| `/buscar` | Busca de CID-10/IBGE com autocomplete |
| `/notificacao` | Verificar se CID-10 é notificação compulsória + fluxo visual |
| `/estatisticas` | Dashboard com gráficos (doenças por capítulo, municípios por estado) |
| `/regioes` | Busca de regiões com filtro estado → município |
| `/docs` | Redireciona pra Scalar |

Deploy:
```bash
# No diretório do frontend Astro
npx wrangler pages deploy dist/
```

### Fase 4: Domínio personalizado

1. Registrar domínio no Cloudflare Registrar
2. Configurar DNS:
   - `seudominio.com.br` → Cloudflare Pages (frontend)
   - `api.seudominio.com.br` → Cloudflare Workers (API)
   - Ou tudo no mesmo domínio com rotas `/api/*` pro Worker

### Fase 5: Dados epidemiológicos (ETL)

- GitHub Actions (free) roda script Python semanalmente
- Baixa dados do InfoGripe e DATASUS
- Processa e insere no D1 via Cloudflare API
- Ou: Cloudflare Workers Cron Triggers (schedule no wrangler.toml)

```toml
[triggers]
crons = ["0 8 * * 1"]  # toda segunda às 8h UTC
```

## Vantagens dessa arquitetura

| Vantagem | Detalhes |
|----------|---------|
| **Custo quase zero** | Só paga o domínio (~R$ 50/ano) |
| **Performance global** | Workers rodam na edge (300+ data centers) |
| **Zero DevOps** | Sem servidor pra gerenciar, sem Docker, sem SSH |
| **SSL automático** | HTTPS grátis e automático |
| **Escala automática** | De 0 a milhões de requests sem configuração |
| **DX excelente** | `wrangler dev` pra rodar local, `wrangler deploy` pra publicar |
| **Hono nativo** | Hono foi originalmente criado pra Cloudflare Workers |

## Migração gradual

Não precisa migrar tudo de uma vez:

1. **Agora** — continuar desenvolvendo local com Node.js + SQLite
2. **Quando quiser publicar** — migrar adapter pra Workers + D1 (poucas mudanças)
3. **Depois** — criar frontend Astro e conectar com a API
4. **Depois** — adicionar domínio personalizado

O código das rotas, schemas, e validação é 100% reutilizado em todas as fases.
