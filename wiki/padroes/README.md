# Padrões de código

Convenções técnicas **extraídas do código real** — não hipotéticas. Quando divergir do que está em `packages/api/src/`, o código vence; atualize a doc.

## Backend (`packages/api`)

- [Rotas Hono + OpenAPI](rotas-hono.md) — anatomia de uma rota com `createRoute`
- [Schemas Zod](schemas-zod.md) — reuso via `.extend()`, factories tipadas
- [Drizzle queries](drizzle.md) — conditions dinâmicas, Promise.all, joins
- [Middleware](middleware.md) — `createMiddleware`, ordem, context vars
- [Erros e respostas](erros.md) — `ErrorSchema`, handler global, formato
- [Testes](testes.md) — SQLite em memória, `app.request`, isolamento
- [Adapters Node vs Workers](adapters-node-workers.md) — proxy DB, entrypoints separados
- [Observabilidade](observabilidade.md) — requestId, logs estruturados

## Princípios gerais

1. **OpenAPI é contrato.** Toda rota passa por `createRoute` com schema Zod. Não existe handler "solto".
2. **Schema gera tipo.** Nunca duplicar tipo TS + schema Zod — Zod é a fonte.
3. **DB é injetado.** Rotas importam `db` do proxy — nunca acessam driver direto.
4. **Shared code em `app.ts`.** Diferenças Node/Workers moram só em `index.ts` e `worker.ts`.
5. **Middleware é transversal.** Não carrega lógica de domínio.
6. **Envelope `{ data, meta }`.** Sempre em lista, quase sempre em único.
7. **Testes usam `:memory:`.** Nunca mock do DB.

## Quando adicionar padrão aqui

- Encontrou convenção no código que se repete em 3+ arquivos
- Resolveu um problema comum de jeito específico (ex: pagination + count em paralelo)
- Decidiu tradeoff que não é óbvio pra quem chega no projeto

## Quando atualizar

Se o código muda o padrão, **esta doc precisa ser atualizada no mesmo commit**. Doc defasada vira armadilha pra agente.
