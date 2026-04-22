# CLAUDE.md — packages/web

Contexto específico do pacote **web** (frontend Astro.js).

## Status

🚧 **Estágio inicial.** Estrutura Astro criada, conteúdo mínimo. Evoluir com cautela.

## Responsabilidade

Frontend público do RefSUS — busca, verificação de notificação, dashboard de estatísticas.

## Stack planejada

- **Astro.js** — framework (estático por padrão, islands arquiteturais)
- **Tailwind CSS** — estilização
- **Islands** — JS só onde precisa (autocomplete, gráficos)
- **Chart.js ou Recharts** — gráficos
- Deploy: **Cloudflare Pages**

## Convenções

- **PT-BR** em URLs, textos, labels (mesma razão da API — ver [ADR 0003](../../wiki/adr/0003-ptbr-em-api-publica.md))
- **Consumir API via `fetch`** pro backend próprio — sem SDK intermediário por enquanto
- **Islands** para interatividade, **estático** pro resto
- Acessibilidade: seguir WCAG AA (público inclui servidor público de município pequeno em máquina antiga)

## Páginas planejadas

| Rota | O que mostra |
|------|--------------|
| `/` | Landing — o que é a API, links |
| `/buscar` | Busca de CID-10/IBGE com autocomplete |
| `/notificacao` | Verificar se CID é notificação + fluxo visual |
| `/estatisticas` | Dashboard com gráficos |
| `/regioes` | Busca estado → município |
| `/docs` | Redirect pra Scalar da API |

## Comunicação com a API

- Dev: `http://localhost:8003/v1/*`
- Prod: mesmo domínio, `/api/v1/*` (via route de Workers)

Configurar via `.env`:

```
PUBLIC_API_BASE=/api/v1
```

## O que NÃO fazer

- ❌ Duplicar lógica de domínio que já está na API (sempre chamar `/v1/*`)
- ❌ Hard-code de URL da API — usar env
- ❌ Adicionar framework JS pesado (React, Vue) como default — islands por partes
- ❌ Quebrar acessibilidade por estética
