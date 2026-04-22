# Changelog

Mudanças notáveis do RefSUS, no estilo [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e semver.

## [Não lançado]

### Adicionado
- Estrutura de documentação: `docs/` (pública) + `wiki/` (interna)
- `CLAUDE.md` como entry point pra agentes
- `wiki/INVARIANTES.md` com regras invioláveis
- ADRs iniciais em `wiki/adr/`

## [0.1.0] — inicial

### Adicionado
- API Hono.js com endpoints `/v1/doencas`, `/v1/sintomas`, `/v1/regioes`, `/v1/notificacao-compulsoria`, `/v1/fluxo-notificacao`, `/v1/stats`
- Seed de 2.045 doenças CID-10, 387 sintomas, 5.598 regiões IBGE, 57 agravos
- Documentação Scalar em `/docs`
- OpenAPI 3.1 auto-gerada via `@hono/zod-openapi`
