# 🔮 Roadmap

Tudo aqui é **futuro** — exploração, não contrato. Antes de implementar qualquer item:

1. Confirmar com o mantainer que virou prioridade
2. Se mudar invariante ou convenção: ADR antes
3. Se afetar schema público: discutir breaking change

## Conteúdo

- [Integração com dados epidemiológicos](integracao-dados-vivos.md) — InfoGripe, SINAN, ETL
- [Volume e validação](volume-e-validacao.md) — custos, free tier, 5 camadas de validação
- [Migração CID-10 → CID-11](migracao-cid11.md) — horizonte 2027
- [Ideias soltas](ideias.md)

## Status

| Item | Prioridade | Bloqueado por |
|------|------------|---------------|
| Migração completa pra Workers + D1 | alta | decisão de domínio |
| Frontend Astro funcional | média | backend estável |
| ETL InfoGripe (SRAG semanal) | média | banco em prod |
| SINAN via pysus | baixa | ETL infra |
| [CID-11](migracao-cid11.md) | baixa | adoção oficial no Brasil (~2027) |

## Promover item do roadmap

Quando um item sai de 🔮 roadmap e vira 🚧 em desenvolvimento:

1. Mover doc do `roadmap/` pra `arquitetura/` (ou criar ADR se mudança estrutural)
2. Atualizar stack table em [`../arquitetura/README.md`](../arquitetura/README.md)
3. Atualizar [`../../CLAUDE.md`](../../CLAUDE.md) se mudou a área de leitura recomendada
