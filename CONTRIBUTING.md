# Contribuindo com o RefSUS

Obrigado por querer contribuir. Antes de abrir PR, leia:

1. [`CLAUDE.md`](CLAUDE.md) — visão geral e convenções
2. [`wiki/INVARIANTES.md`](wiki/INVARIANTES.md) — regras invioláveis
3. [`wiki/guias-dev/README.md`](wiki/guias-dev/README.md) — guias práticos

## Passo a passo

1. Faça fork e clone
2. `pnpm install` na raiz
3. Crie branch a partir de `main`: `git checkout -b feat/nome-curto`
4. Faça a mudança seguindo as convenções
5. `pnpm test` e `pnpm lint` passam
6. Commit em PT-BR imperativo (ex: `adiciona filtro por UF em /regioes`)
7. Abra PR explicando o **porquê**, não só o que

## O que não aceitamos

- Renomear endpoints/tabelas de PT-BR pra inglês (veja INVARIANTES)
- Mock de banco em teste de integração
- Dado sem fonte oficial rastreável
- Dependência nova sem justificativa no PR

## Código de conduta

Respeito, foco em dado, evitar achismo. Se for divergência técnica, abra issue com referência (portaria, RFC, benchmark).
