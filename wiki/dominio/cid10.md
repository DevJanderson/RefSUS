# CID-10

## O que é

Classificação Estatística Internacional de Doenças e Problemas Relacionados à Saúde, 10ª revisão (OMS). Tradução oficial brasileira pelo DATASUS.

## Estrutura

- **22 capítulos** (I a XXII), agrupando doenças por sistema/natureza
- **Categorias** de 3 caracteres (ex: `A00`, `A01`, ..., `Z99`)
- **Subcategorias** de 4 caracteres (ex: `A00.0`, `A00.1`, `A00.9`)
- **2.045 códigos** principais no dataset do RefSUS

## Capítulo XVIII — Sintomas

Códigos `R00-R99` cobrem sintomas, sinais e achados anormais. Exposto separadamente no RefSUS como `/v1/sintomas` (387 códigos).

## CID-11

A OMS publicou CID-11 em 2022, mas o Brasil ainda usa CID-10 oficialmente. Migração prevista mas sem data.

## Fonte canônica

- OMS: https://www.who.int/classifications/icd/
- DATASUS (tradução BR): http://www.datasus.gov.br/cid10/V2008/cid10.htm

## No código

- Tabela: `doencas` em `packages/api/src/db/`
- CSV: `packages/api/data/doencas.csv`
- Rotas: `packages/api/src/routes/doencas.ts`
