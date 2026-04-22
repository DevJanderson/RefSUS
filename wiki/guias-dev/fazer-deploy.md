# Fazer deploy

## Stack de produção

- **API**: Cloudflare Workers + D1
- **Frontend**: Cloudflare Pages
- **Domínio**: ainda a definir

Plano completo: [`../arquitetura/deploy-cloudflare.md`](../arquitetura/deploy-cloudflare.md).

## Pré-requisitos

```bash
pnpm add -g wrangler          # se ainda não tem
wrangler login                 # autenticar no Cloudflare
```

## Deploy da API

```bash
cd packages/api

# 1. Criar DB D1 (uma vez só)
wrangler d1 create refsus-db
# copiar o ID retornado pro wrangler.toml

# 2. Aplicar migrations
pnpm d1:migrate

# 3. Seed
pnpm d1:seed:generate   # gera scripts/seed.sql a partir dos CSVs
pnpm d1:seed            # aplica no D1

# 4. Deploy do Worker
pnpm deploy
```

## Deploy do frontend

```bash
cd packages/web
pnpm build
npx wrangler pages deploy dist/
```

## Secrets

Wrangler secrets (não commitados):

```bash
wrangler secret put NOME_DO_SECRET
```

## Verificação pós-deploy

- [ ] `/health` retorna 200
- [ ] `/v1/stats` retorna contagens esperadas
- [ ] `/docs` renderiza
- [ ] Rate limit funciona (teste com 70 req/min)
- [ ] Latência P50 < 100ms de múltiplas regiões

## Rollback

Ver [`../runbooks/rollback.md`](../runbooks/rollback.md).
