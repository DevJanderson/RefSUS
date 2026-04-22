# Architecture Decision Records (ADR)

Registro de decisões arquiteturais importantes. Append-only: decisões antigas **não são deletadas**, são marcadas como **Superseded** quando substituídas.

## Por que ADR

Código mostra **o que foi feito**. ADR mostra **por que**. Em 6 meses, ninguém lembra do contexto. Em 2 anos, alguém vai querer reverter e precisa saber os tradeoffs considerados.

## Formato

Use [`template.md`](template.md). Cada ADR tem:

1. **Título** curto e descritivo
2. **Status** — Proposed / Accepted / Superseded / Deprecated
3. **Contexto** — o problema
4. **Decisão** — o que foi escolhido
5. **Consequências** — o que ganha e o que perde
6. **Alternativas** — o que foi considerado e descartado

## Quando escrever ADR

- Escolha de tech (framework, banco, linguagem)
- Convenção que contraria o óbvio (ex: PT-BR em API pública)
- Mudança que afeta múltiplos pacotes
- Tradeoff entre simplicidade e flexibilidade

## Quando NÃO escrever ADR

- Decisão reversível trivial (nome de variável, estrutura de pasta dentro de um arquivo)
- Padrão óbvio do ecossistema (usar Vitest em projeto TS moderno)

## Índice

- [0001 — Monorepo com pnpm workspaces](0001-monorepo-pnpm.md)
- [0002 — Hono.js em Cloudflare Workers](0002-hono-cloudflare-workers.md)
- [0003 — PT-BR em API pública](0003-ptbr-em-api-publica.md)

## Numeração

Sequencial, 4 dígitos (`0001`, `0002`, ...). Quebra é feita via Supersede, não renumeração.
