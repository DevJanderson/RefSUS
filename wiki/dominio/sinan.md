# SINAN — Sistema de Informação de Agravos de Notificação

## O que é

Sistema oficial do Ministério da Saúde pra registro de notificações compulsórias. Alimentado por profissionais de saúde nas unidades.

## Fluxo

1. Profissional diagnostica caso suspeito/confirmado de agravo
2. Preenche **Ficha de Notificação** (imediata ou semanal, conforme agravo)
3. Vigilância epidemiológica municipal consolida
4. Dado sobe pro estado → Ministério da Saúde
5. Aparece em boletins epidemiológicos com atraso de semanas a meses

## Atraso de notificação

Dado recente é sempre incompleto. Depois de 2-4 semanas, números se estabilizam. Por isso fontes como [InfoGripe](../roadmap/integracao-dados-vivos.md) fazem **nowcasting** (correção estatística).

## Relação com o RefSUS

Hoje: RefSUS mapeia CID-10 → agravo SINAN (qual ficha preencher).
Futuro (🔮): RefSUS consumir dado SINAN pra expor série histórica — ver [`roadmap/integracao-dados-vivos.md`](../roadmap/integracao-dados-vivos.md).

## Fontes

- Portal SINAN: https://portalsinan.saude.gov.br
- e-SUS Notifica: https://notifica.saude.gov.br
