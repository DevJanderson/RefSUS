# 0002 — Hono.js em Cloudflare Workers + D1

- **Status:** Accepted
- **Data:** 2026-04
- **Autor(es):** DevJanderson

## Contexto

Precisamos servir uma API pública pra saúde coletiva brasileira com:
- Latência baixa no Brasil inteiro
- Custo próximo de zero (projeto público)
- Zero DevOps (mantainer único, tempo escasso)
- Dados de referência relativamente estáticos (~1.5 MB, cabem num banco edge)

Opções de runtime:
- **Node.js + VPS** (Fly.io, Railway, DigitalOcean)
- **Node.js + serverless** (Vercel Functions, AWS Lambda)
- **Cloudflare Workers** (V8 isolates, edge)
- **Deno Deploy**

## Decisão

**Hono.js** como framework + **Cloudflare Workers** (runtime) + **D1** (banco) + **Pages** (frontend).

Em desenvolvimento mantemos Node.js + better-sqlite3 pra iteração rápida. Produção usa Workers + D1.

## Consequências

### Positivas
- Hono foi **criado pra Workers** — zero impedance mismatch
- D1 é SQLite distribuído — schema local e prod são **o mesmo**
- Free tier generoso: 100k req/dia Workers, 5M leituras/dia D1
- Latência P50 < 50ms globalmente
- Custo total ~R$ 50/ano (só domínio)
- Mesmo código roda em Node (dev) e Workers (prod) via adapter

### Negativas
- Workers têm limites (128 MB RAM, 30s CPU em free, 50ms em paid) — ETL pesado **não cabe**, terá de ser externo
- D1 é SQLite — sem JSON avançado, sem arrays, sem extensões Postgres
- Cold start raro mas existe
- Debugging em prod mais opaco que VPS

### Neutras
- Lock-in com Cloudflare. Aceito: migração pra outro runtime é trabalhosa mas possível (Hono roda em vários)

## Alternativas consideradas

### Node.js + Fly.io
Mais flexível, sem limites de memória. Mas: container pra gerenciar, latência centralizada (1 região free), custo cresce rápido com tráfego. Descartado pra MVP.

### Bun + Railway
Runtime moderno, bom DX. Plataforma menos madura, preço pior que CF no free tier. Reconsiderar no futuro.

### Fastify + Vercel
Vercel Functions OK mas pricing pra alto volume é pior que CF.

## Referências

- Hono docs: https://hono.dev
- Cloudflare Workers pricing: https://workers.cloudflare.com/
- Plano completo: [`../arquitetura/deploy-cloudflare.md`](../arquitetura/deploy-cloudflare.md)
