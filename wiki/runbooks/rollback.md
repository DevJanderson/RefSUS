# Rollback

## Sintomas

- Deploy novo causou erros 5xx em massa
- Endpoint crítico parou de responder
- Dados respondendo errado

## Rollback do Worker

```bash
cd packages/api

# 1. Listar deploys
wrangler deployments list

# 2. Identificar último deploy bom (antes do problema)
# Copiar o deployment ID

# 3. Rollback
wrangler rollback <deployment-id>
```

Alternativa: deploy da versão anterior do código.

```bash
git checkout <sha-bom>
pnpm --filter api deploy
```

## Rollback de dados (D1)

D1 **não tem rollback automático de dados**. Estratégia:
- Nunca sobrescrever, sempre versionar (ver [INVARIANTES](../INVARIANTES.md))
- Manter coluna `_meta.versao_etl` em registros versionados
- Reverter via SQL: `UPDATE ... WHERE versao_etl = <ruim>` pra marcar como inativo

Se sobrescreveu sem versionar (violação de invariante):
1. Recuperar CSV anterior do git
2. Seguir [reingestao-dados.md](reingestao-dados.md) com ele
3. Documentar o incidente

## Verificação pós-rollback

- `/health` retorna 200
- `/v1/stats` bate com contagens conhecidas
- Endpoints críticos respondem
- Logs sem 5xx na janela de 15min

## Comunicação

- Atualizar status (se tiver página)
- Anotar no `CHANGELOG.md` do release revertido
- Issue no GitHub pra rastrear causa raiz
