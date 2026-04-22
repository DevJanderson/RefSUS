# Rotacionar secrets

_Stub — expandir quando secrets forem introduzidos._

## Quando

- Secret vazou (commit acidental, screenshot, log)
- Rotação periódica (6 meses por padrão)
- Ex-colaborador com acesso

## Passos (template)

1. Gerar novo valor
2. `wrangler secret put NOME_DO_SECRET` com o novo valor
3. Verificar que Worker pega a nova versão (deploy se necessário)
4. Invalidar o antigo no provedor
5. Monitorar logs por 1h pra detectar uso do antigo

## Secrets atualmente em uso

_Nenhum em produção ainda._ Atualizar esta lista ao introduzir.

## Verificação

- Endpoint que usa o secret continua respondendo 200
- Sem erros 401/403 em logs
