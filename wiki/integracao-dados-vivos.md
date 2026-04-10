# RefSUS — Integração com Dados Epidemiológicos Reais

## O problema

A API hoje serve **dados de referência estáticos** (CID-10, IBGE, notificação compulsória). Isso é útil pra consulta, mas o profissional de saúde coletiva precisa de **dados vivos**:

- Quantos casos de dengue meu município teve essa semana?
- Está acima do esperado?
- Qual a tendência?
- Qual a cobertura vacinal?

Nenhuma API pública no Brasil responde isso de forma limpa. Os dados existem, mas estão espalhados em sistemas diferentes, formatos diferentes, e com atualizações irregulares.

## Fontes de dados disponíveis

### 1. InfoGripe API (Fiocruz) — A MELHOR FONTE DISPONÍVEL

**O que é:** Monitoramento de SRAG (Síndrome Respiratória Aguda Grave) da Fiocruz.

**Por que é a melhor:**
- API JSON sem autenticação
- Atualizada semanalmente (segundas-feiras)
- Dados por semana epidemiológica, território, patógeno e faixa etária
- Faz **nowcasting** (correção de atraso de notificação) — dado exclusivo
- Cobre influenza A, B, VSR e SARS-CoV-2

**URL:** `http://info.gripe.fiocruz.br`

**Exemplo de query:**
```bash
# SRAG nacional, todas as semanas de 2024
curl "http://info.gripe.fiocruz.br/data/detailed/1/2/1/0/0/202401/202452/1/1"

# SRAG em São Paulo (código 35)
curl "http://info.gripe.fiocruz.br/data/detailed/1/2/2/35/0/202401/202452/1/1"
```

**Limitação:** Só cobre SRAG (doenças respiratórias graves), não dengue, tuberculose, etc.

### 2. OpenDataSUS — ElasticSearch Endpoints

**O que é:** Dados do Ministério da Saúde acessíveis via ElasticSearch.

**Endpoints funcionais:**

| Dataset | URL |
|---------|-----|
| COVID-19 SRAG | `https://elasticsearch-saps.saude.gov.br/desc-srag-*/_search` |
| Vacinação COVID | `https://imunizacao-es.saude.gov.br/desc-imunizacao/_search` |

**Exemplo:**
```bash
curl -X POST "https://elasticsearch-saps.saude.gov.br/desc-srag-2021-2025/_search" \
  -H "Content-Type: application/json" \
  -d '{
    "size": 10,
    "query": {
      "bool": {
        "must": [
          { "match": { "co_mun_not": "355030" } }
        ]
      }
    }
  }'
```

**Problemas reais:**
- Endpoints mudam sem aviso (índices renomeados, schemas alterados)
- Sem SLA — podem ficar offline
- Rate limiting informal (requests agressivos são bloqueados)
- Nomes de campos inconsistentes entre datasets

### 3. DATASUS FTP + pysus — SINAN, SIM, SIH

**O que é:** Arquivos brutos dos sistemas de saúde (notificações, óbitos, internações).

**Onde:** `ftp://ftp.datasus.gov.br/dissemin/publicos/`

**Sistemas disponíveis:**

| Sistema | Dados | Formato | Atraso típico |
|---------|-------|---------|---------------|
| SINAN | Notificações (dengue, TB, etc.) | DBC | Meses |
| SIM | Mortalidade (atestados de óbito) | DBC | 1-2 anos |
| SIH | Internações hospitalares | DBC | Meses |
| SINASC | Nascidos vivos | DBC | Meses |

**Como acessar (Python):**
```python
from pysus.online_data.sinan import download

# Dengue em São Paulo, 2023
df = download('dengue', 2023, 'SP')
```

**Problemas reais:**
- Formato DBC precisa de decompressão especial
- Dados com atraso de meses a anos
- Não é API — é bulk download + processamento local

### 4. IBGE API — Demografia

**URL:** `https://servicodados.ibge.gov.br/api/v3/`

**Útil pra:** População por município (necessário pra calcular taxas de incidência).

```bash
# População estimada de São Paulo
curl "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2024/variaveis/9324?localidades=N6[3550308]"
```

**Qualidade:** Alta. API bem documentada, confiável, sem autenticação.

### 5. TabNet/DATASUS

**URL:** `http://tabnet.datasus.gov.br`

Interface web antiga pra consultar dados agregados. Pode ser acessada programaticamente, mas é frágil (POST requests com parâmetros não documentados, resposta em HTML).

**Veredicto:** Evitar como dependência de produção. Usar pysus em vez.

## O que NÃO existe (ainda)

- API REST pra consultar SINAN em tempo real por CID-10 + município
- Dados de incidência/prevalência por API
- Cobertura vacinal por município via API limpa
- Série histórica de qualquer doença via API

## Arquitetura de integração recomendada

```
┌────────────────────────────────────────────────────────────┐
│                       RefSUS API                            │
│               (Hono.js + PostgreSQL/D1)                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  NEAR-REAL-TIME (cron semanal):                            │
│  ├── InfoGripe API → SRAG por território/semana            │
│  ├── OpenDataSUS ES → SRAG/COVID hospitalizações           │
│  └── IBGE API → População por município                    │
│                                                            │
│  BULK ETL (cron mensal):                                   │
│  ├── SINAN via pysus → Dengue, TB, Hanseníase, etc.        │
│  ├── SIM via pysus → Mortalidade por CID-10                │
│  ├── SIH via pysus → Internações por CID-10                │
│  └── OpenDataSUS Parquet → Vacinação                       │
│                                                            │
│  DADOS DE REFERÊNCIA (já implementado):                    │
│  ├── CID-10 (2.045 doenças + 387 sintomas)                │
│  ├── IBGE (27 estados + 5.571 municípios)                  │
│  ├── Notificação compulsória (57 agravos)                  │
│  └── Fluxo de notificação (passos oficiais)                │
│                                                            │
│  CRUZAMENTO (o valor real):                                │
│  ├── Casos por doença + município + semana epi             │
│  ├── Taxa de incidência (casos / população × 100k)         │
│  ├── Série histórica + tendência                           │
│  ├── Comparação com semanas/anos anteriores                │
│  └── Alertas (acima do esperado?)                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Endpoints que isso habilitaria

| Endpoint | O que responderia |
|----------|-------------------|
| `GET /v1/epidemiologia/dengue?municipio=355030&ano=2024` | Casos de dengue em SP por semana epi |
| `GET /v1/epidemiologia/dengue/tendencia?uf=SP` | Tendência ascendente/descendente |
| `GET /v1/epidemiologia/srag?municipio=355030` | SRAG por semana (via InfoGripe) |
| `GET /v1/epidemiologia/alerta?municipio=355030` | Doenças acima do esperado |
| `GET /v1/epidemiologia/mortalidade?cid=A90&uf=SP` | Óbitos por dengue em SP |
| `GET /v1/demografa/populacao?municipio=355030` | População pra calcular taxas |

## Stack técnica pra o ETL

| Tecnologia | Uso |
|-----------|-----|
| **Python + pysus** | Download e descompressão de DBC do DATASUS |
| **Polars** | Processamento de DataFrames (mais rápido que pandas) |
| **DuckDB** | Query em Parquet sem carregar tudo na memória |
| **PostgreSQL + TimescaleDB** | Armazenamento de séries temporais (casos por semana) |
| **Node.js cron** | Agendamento de ingestão (semanal/mensal) |

## Prioridade de implementação

| Fase | O que | Fonte | Impacto |
|------|-------|-------|---------|
| **1** | SRAG por território/semana | InfoGripe API | Alto — dado mais fresco disponível |
| **2** | População por município | IBGE API | Alto — necessário pra calcular taxas |
| **3** | Dengue/Chikungunya/Zika | SINAN via pysus | Alto — maior volume de notificações |
| **4** | Tuberculose, Hanseníase | SINAN via pysus | Médio — doenças prioritárias |
| **5** | Mortalidade por CID-10 | SIM via pysus | Médio — indicador de gravidade |
| **6** | Vacinação | OpenDataSUS | Médio — cobertura vacinal |
| **7** | Internações | SIH via pysus | Baixo — dado complementar |

## Considerações de produção

1. **Nenhuma fonte externa é confiável 100%.** Implementar retry, circuit breaker e fallback local
2. **Dados têm atraso.** SINAN: meses. SIM: 1-2 anos. InfoGripe: ~1 semana. Sempre exibir a data de referência dos dados
3. **Arquivos podem ser grandes.** Parquet de vacinação COVID tem GBs. Usar DuckDB pra processar sem estourar memória
4. **Rate limiting informal.** Espaçar requests, cache agressivo, baixar em horários de pouco uso (madrugada brasileira)
5. **Schemas mudam.** Nomes de campos no ElasticSearch e nos CSVs do DATASUS mudam entre versões. Validar schemas no ETL

## Fontes e referências

| Recurso | URL |
|---------|-----|
| OpenDataSUS | https://opendatasus.saude.gov.br |
| InfoGripe (Fiocruz) | http://info.gripe.fiocruz.br |
| DATASUS FTP | ftp://ftp.datasus.gov.br/dissemin/publicos/ |
| IBGE API | https://servicodados.ibge.gov.br/api/docs/ |
| pysus (Python) | https://github.com/AlertaDengue/PySUS |
| TabNet | http://tabnet.datasus.gov.br |
| Portal SINAN | https://portalsinan.saude.gov.br |
| e-SUS Notifica | https://notifica.saude.gov.br |
| Brasil.IO | https://brasil.io |
| PCDaS (Fiocruz) | https://pcdas.icict.fiocruz.br |
