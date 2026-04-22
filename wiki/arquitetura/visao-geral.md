# RefSUS — Visão Geral

## O que é

RefSUS é a API pública de dados de referência do SUS. Combina as bases que todo profissional de saúde coletiva usa diariamente num único lugar:

- **CID-10** — 2.045 códigos de doenças com capítulo e categoria
- **Sintomas CID-10** — 387 códigos do Capítulo XVIII (R00-R99)
- **IBGE** — 27 estados e 5.571 municípios
- **Notificação Compulsória** — 57 agravos com mapeamento CID-10 ↔ SINAN
- **Fluxo de Notificação** — passos oficiais com base legal e prazos

## Por que existe

Nenhuma API pública no Brasil combina CID-10 + IBGE + contexto de vigilância epidemiológica:

| API existente | O que oferece | O que falta |
|--------------|---------------|-------------|
| IBGE Localidades | Estados e municípios | Sem dados de saúde |
| OpenDataSUS | Dados brutos (CSV/Parquet) | Sem API de referência limpa |
| BrasilAPI | CEP, CNPJ, bancos | CID-10 pedido desde 2021 (issue #287), nunca feito |
| DEMAS/MS | Alguns endpoints de saúde | Mal documentado, instável |

O RefSUS preenche esse gap.

## Para quem

- Equipes de **vigilância epidemiológica** dos 5.570 municípios
- Desenvolvedores construindo sistemas de **notificação SINAN**
- Aplicações que precisam **validar códigos CID-10 e IBGE**
- Profissionais preenchendo **fichas de notificação e atestados de óbito**
- Pesquisadores em **epidemiologia e saúde coletiva**

## O que o RefSUS faz hoje

1. **Verificação de notificação compulsória** — digita o CID-10, sabe se precisa notificar, em qual prazo, e qual agravo SINAN
2. **Fluxo de notificação** — passos oficiais (imediata/semanal) com responsável, prazo e base legal
3. **Mapeamento CID-10 → SINAN** — sabe qual ficha preencher
4. **Autocomplete** — campos de busca em tempo real pra doenças, sintomas e municípios
5. **Busca por código e nome** — médico busca "A90" ou "dengue"
6. **Lookup por código natural** — `/codigo/A90`, `/ibge/3550308`
7. **Regiões encadeadas** — `/estados/SP/municipios` pra formulários
8. **Facets** — capítulos e categorias CID-10 pra construir filtros
9. **Estatísticas** — distribuição por capítulo, municípios por estado, maior/menor
10. **Fontes oficiais** — leis, portarias, sistemas, fichas — tudo com URL

## O que o RefSUS ainda não faz (roadmap)

- Dados epidemiológicos reais (casos, óbitos, tendências)
- Relação doença-sintoma pra apoio diagnóstico
- Regiões de saúde (CIR)
- Cobertura vacinal
- Frontend visual (planejado com Astro.js)

Detalhes em [Integração com Dados Epidemiológicos](../roadmap/integracao-dados-vivos.md) (🔮 futuro).
