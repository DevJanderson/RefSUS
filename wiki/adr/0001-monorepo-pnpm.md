# 0001 — Monorepo com pnpm workspaces

- **Status:** Accepted
- **Data:** 2026-04
- **Autor(es):** DevJanderson

## Contexto

O RefSUS vai ter pelo menos dois artefatos públicos:

1. **API** (Hono.js) — servida no domínio raiz
2. **Frontend** (Astro.js) — busca visual, dashboards, docs

Ambos compartilham: schemas de resposta, tipos de domínio (Doença, Agravo), tokens de design. Evoluem em lockstep (endpoint novo → tela nova).

Opções estruturais:
- **Repositórios separados** — `refsus-api` e `refsus-web`
- **Monorepo** — tudo num repo com `packages/`

## Decisão

Monorepo com **pnpm workspaces**.

Estrutura:
```
RefSUS/
├── pnpm-workspace.yaml
└── packages/
    ├── api/
    └── web/
```

## Consequências

### Positivas
- Mudança que cruza api/web vira **um PR**, não dois sincronizados
- Tipos compartilhados sem publicar pacote npm
- Setup novo: `pnpm install` na raiz resolve tudo
- pnpm é rápido e usa store global (economiza disco)
- Versionamento unificado

### Negativas
- CI precisa filtrar (`pnpm --filter api test`) pra rodar só o que mudou
- Deploy tem que saber qual pacote publicar (resolvido com wrangler por pacote)

### Neutras
- Dependências podem vazar entre pacotes se não for disciplinado (mas pnpm evita isso melhor que npm/yarn)

## Alternativas consideradas

### Turbo / Nx
Mais ferramentas, cache de build, orquestração. Overkill pra 2 pacotes. Reconsiderar se virarem 5+.

### Lerna + npm workspaces
Lerna está em modo manutenção. pnpm workspaces nativo é mais simples e rápido.

### Repos separados
Coordenação de PRs duplicada. Tipos duplicados ou pacote npm interno (complicação). Descartado.

## Referências

- pnpm workspaces: https://pnpm.io/workspaces
