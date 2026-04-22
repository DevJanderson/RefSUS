# RefSUS — Wiki interna

Documentação pra **contribuidores e agentes**. Se você vai **consumir** a API, veja [`docs/`](../docs/README.md).

**Antes de mexer em qualquer coisa:** [`../CLAUDE.md`](../CLAUDE.md) e [`INVARIANTES.md`](INVARIANTES.md).

## Categorias

| Pasta | O que contém | Ciclo de vida |
|-------|--------------|---------------|
| [`dominio/`](dominio/) | Conhecimento SUS (CID-10, SINAN, base legal) | Imutável |
| [`arquitetura/`](arquitetura/) | Decisões estruturais e diagramas | Lento |
| [`adr/`](adr/) | Architecture Decision Records | Append-only |
| [`dados/`](dados/) | Data dictionary, fontes, schema do banco | Médio |
| [`guias-dev/`](guias-dev/) | How-to pro contribuidor | Médio |
| [`runbooks/`](runbooks/) | Operação quando algo quebra | Append |
| [`roadmap/`](roadmap/) | 🔮 Futuro — não implementar sem discussão | Alto |

## Leitura inicial sugerida

1. [`../CLAUDE.md`](../CLAUDE.md) — entry point
2. [`INVARIANTES.md`](INVARIANTES.md) — regras duras
3. [`arquitetura/visao-geral.md`](arquitetura/visao-geral.md) — o que é o projeto
4. [`dominio/notificacao-compulsoria.md`](dominio/notificacao-compulsoria.md) — se for mexer em agravos
5. [`guias-dev/`](guias-dev/) — pra começar a contribuir
