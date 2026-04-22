# Cache

## Cache-Control padrão

Respostas de `/v1/*` vêm com:

```
Cache-Control: public, max-age=3600
```

Ou seja, **1 hora** de cache. Dados de referência (CID-10, IBGE, agravos) mudam raramente — aproveite.

## Forçar refresh

```
Cache-Control: no-cache
```

no request header. Use só quando realmente precisar de dado fresco (raro pra referência).

## Estratégia de cliente recomendada

- **Cache local** (memória, IndexedDB) respeitando `max-age` do response
- **ETags** (planejado, ainda não implementado)
- **Service Worker** pra apps offline-first

## Quando vai mudar

- Nova Portaria de notificação compulsória (raro, ~1x/ano)
- Nova estimativa IBGE (~1x/ano)
- Atualização de CID (próxima: CID-11 — ver roadmap)
