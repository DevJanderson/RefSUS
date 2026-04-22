# Reingestão de dados

## Quando

- Portaria/lei nova publicada (ex: atualização da lista de notificação compulsória)
- CSV corrompido ou com dado errado detectado em produção
- Nova versão de dataset IBGE/OMS

## Passos — dev

```bash
# 1. Substituir CSV em packages/api/data/
cp ~/downloads/novo-dataset.csv packages/api/data/<dataset>.csv

# 2. Deletar banco local
rm packages/api/data/referencia.db

# 3. Rodar — seed carrega automático
pnpm dev:api

# 4. Validar contagens
curl http://localhost:8003/v1/stats
```

## Passos — produção (D1)

```bash
cd packages/api

# 1. Regerar SQL de seed a partir dos CSVs novos
pnpm d1:seed:generate

# 2. Revisar scripts/seed.sql manualmente

# 3. Se schema mudou, migrar primeiro
pnpm d1:migrate

# 4. Aplicar seed
pnpm d1:seed

# 5. Validar via API pública
curl https://api.refsus.<dominio>/v1/stats
```

## Verificação

- `/v1/stats` bate com o esperado (contagem de registros)
- Amostra de endpoints crítica:
  - `/v1/doencas/codigo/A00`
  - `/v1/notificacao-compulsoria/verificar/A90`
  - `/v1/regioes/estados`
- Zero logs de erro 5xx na janela de 15min após re-seed

## Registrar

Atualizar [`../dados/changelog-dados.md`](../dados/changelog-dados.md) com:
- Data
- Qual dataset
- Fonte (URL, data de referência)
- Quem executou
