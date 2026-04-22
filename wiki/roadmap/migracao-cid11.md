# 🔮 Migração CID-10 → CID-11

> **Status:** 🔮 FUTURO — horizonte 2027, dependente de adoção oficial.
> **Prioridade atual:** baixa. Acompanhar, não implementar.

## Por que isso existe no roadmap

A OMS publicou a **CID-11 em 2019** e o Brasil começou a implementação oficial **em 2021**, com término previsto **em 2027** (fonte: [Panorama da implementação da CID-11 no Brasil, PAHO/Rev Panam Salud Publica, 2025](https://iris.paho.org/bitstreams/ed8df7f5-a8b6-4741-9ff6-6cbe86205736/download)).

Se o RefSUS segue ancorado só em CID-10, fica obsoleto no meio do ciclo de adoção. Mas antes de 2026-2027 o custo de suportar CID-11 supera o benefício — a tradução oficial em pt-BR ainda está sendo consolidada pelo MS/OPAS.

## O que muda entre CID-10 e CID-11

| Aspecto | CID-10 | CID-11 |
|---------|--------|--------|
| Nº de categorias | ~14k | ~17k |
| Formato do código | `X00.0` alfanumérico simples | `1A00.00` alfanumérico com stem/extensão |
| Estrutura | Hierarquia rígida, uma categoria por código | Ontologia, código pode ter múltiplas propriedades (severidade, anatomia, etiologia) |
| Tradução oficial BR | DATASUS (estável, 2008) | MS/OPAS (em construção) |
| Uso legal no Brasil | Obrigatório em SINAN, SIM, etc. | Coexistirá com CID-10 até 2027 |

## Estratégia proposta (quando priorizar)

Não-quebrar a API atual. Abordagem **aditiva**:

1. Manter `/v1/doencas` com CID-10 como é hoje — continua funcionando.
2. Adicionar nova coluna `codigo_cid11` opcional em `doencas` quando tabela de correspondência MS for publicada.
3. Novo endpoint `/v1/doencas/mapear?de=cid10&codigo=A90` retorna equivalente(s) em CID-11.
4. Novo endpoint `/v2/doencas?padrao=cid11` (opt-in via path), quando houver demanda real.

## O que observar pra saber a hora

- MS/OPAS publicar tabela de correspondência CID-10 ↔ CID-11 em pt-BR
- SINAN/SIM começarem a aceitar códigos CID-11
- Aparecerem issues pedindo CID-11 no RefSUS ou em concorrentes (BrasilAPI, PySUS)
- Lista de notificação compulsória ser reemitida com CID-11

Até lá: não implementar.

## Referências

- [Panorama da implementação da CID-11 no Brasil (PAHO, 2025)](https://iris.paho.org/bitstreams/ed8df7f5-a8b6-4741-9ff6-6cbe86205736/download)
- [CID-11 oficial (OMS)](https://icd.who.int/browse/2025-01/mms/en)
- [Tradução DATASUS CID-10 (fonte atual do RefSUS)](http://www.datasus.gov.br/cid10/V2008/cid10.htm)
