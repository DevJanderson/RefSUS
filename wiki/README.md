# RefSUS — Wiki

API pública de dados de referência para o SUS e saúde coletiva no Brasil.

## O que é o RefSUS

Base de consulta unificada de dados de referência que todo profissional de vigilância epidemiológica, atenção primária e gestão em saúde usa diariamente. CID-10, IBGE, notificação compulsória e fluxos oficiais — num único lugar, com documentação interativa.

## Índice

### Sobre o projeto
- [Visão Geral](visao-geral.md) — por que existe, pra quem, diferenciais

### Domínio de saúde
- [Notificação Compulsória](notificacao-compulsoria.md) — base legal, 57 agravos, fluxos, casos de uso
- [Dados e Fontes Oficiais](dados-e-fontes.md) — CSVs, fontes (OMS, DATASUS, IBGE, MS), rastreabilidade

### Integração e uso
- [Guia de Uso](guia-de-uso.md) — curl, JavaScript, Python, rate limiting, cache

### Evolução
- [Integração com Dados Epidemiológicos](integracao-dados-vivos.md) — InfoGripe, DATASUS, ETL pipeline
- [Volume de Dados e Validação](volume-e-validacao.md) — quanto custa, 5 camadas de validação, free tier
- [Plano de Deploy](plano-deploy-cloudflare.md) — Cloudflare Workers + D1 + Pages (Astro.js)

### Referência técnica
- Endpoints e schemas → `http://localhost:8003/docs` (Scalar, gerado automaticamente)
- Stack e arquitetura → `README.md` na raiz do repositório
