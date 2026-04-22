# Endpoints — Referência

Lista completa auto-gerada em **[localhost:8003/docs](http://localhost:8003/docs)** (Scalar).
OpenAPI 3.1 em **[localhost:8003/openapi.json](http://localhost:8003/openapi.json)**.

Resumo:

## Doenças (CID-10)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/doencas` | Lista com filtros `q`, `capitulo`, `limit`, `offset` |
| GET | `/v1/doencas/codigo/{codigo}` | Lookup por código CID-10 |
| GET | `/v1/doencas/autocomplete` | Typeahead |
| GET | `/v1/doencas/capitulos` | Lista de capítulos |

## Sintomas (CID-10 R00-R99)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/sintomas` | Lista |
| GET | `/v1/sintomas/autocomplete` | Typeahead |

## Regiões (IBGE)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/regioes/estados` | 27 estados |
| GET | `/v1/regioes/estados/{uf}/municipios` | Cidades do estado |
| GET | `/v1/regioes/ibge/{codigo}` | Lookup por código IBGE |
| GET | `/v1/regioes/municipios/autocomplete` | Typeahead |

## Notificação compulsória

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/notificacao-compulsoria` | Lista agravos, filtro `tipo=imediata\|semanal` |
| GET | `/v1/notificacao-compulsoria/verificar/{codigo}` | Verifica se CID-10 precisa notificar |

## Fluxo de notificação

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/fluxo-notificacao/imediata` | Passos, prazos, base legal |
| GET | `/v1/fluxo-notificacao/semanal` | Passos, prazos, base legal |

## Utilidade

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/stats` | Contagens gerais |
| GET | `/health` | Health check |
| GET | `/docs` | Documentação Scalar |
| GET | `/openapi.json` | Spec OpenAPI 3.1 |
