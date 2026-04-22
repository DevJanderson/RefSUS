# 🔮 Volume de Dados e Validação

> **Status:** 🔮 FUTURO — premissas de volume e validação pros dados epidemiológicos que ainda serão integrados.
> **Stack hoje** é dados de referência estáticos (~1.5 MB em SQLite local). Custos, free tiers e camadas de validação descritos aqui valem **quando houver ETL**.

## Quanto de dados precisamos

### Dados de referência (já implementados)

| Tabela | Registros | Tamanho |
|--------|-----------|---------|
| Doenças CID-10 | 2.045 | ~500 KB |
| Sintomas CID-10 | 387 | ~50 KB |
| Regiões IBGE | 5.598 | ~800 KB |
| Notificação compulsória | 57 agravos + ~300 CIDs | ~30 KB |
| Fluxo de notificação | JSON estático | ~10 KB |
| **Total referência** | | **~1.5 MB** |

### Dados epidemiológicos (a implementar)

| Dado | Fonte | Registros/ano | Tamanho/ano |
|------|-------|---------------|-------------|
| SRAG (respiratórias) | InfoGripe/Fiocruz | ~290k (5.570 municípios × 52 semanas) | ~30 MB |
| Dengue/Chikungunya/Zika | SINAN via DATASUS | ~1.5 milhão notificações | ~200 MB |
| Tuberculose | SINAN via DATASUS | ~80k casos | ~10 MB |
| Hanseníase | SINAN via DATASUS | ~30k casos | ~4 MB |
| Mortalidade | SIM via DATASUS | ~1.4 milhão óbitos | ~180 MB |
| Internações | SIH via DATASUS | ~11 milhões | ~1.5 GB |
| População | IBGE API | 5.570 registros | ~1 MB |

### Cenários de implementação

| Cenário | O que inclui | Tamanho total | Cabe no free tier? |
|---------|-------------|---------------|-------------------|
| **Mínimo** | Referência + InfoGripe (2 anos) | ~60 MB | Turso (9 GB) ✅, Neon (500 MB) ✅ |
| **Intermediário** | + Dengue + TB + População | ~500 MB | Turso ✅, Neon ✅ (no limite) |
| **Completo** | + SIM + SIH + Vacinação | ~2 GB | Turso ✅, Neon ❌ (precisaria pago) |

**Recomendação:** Começar pelo cenário mínimo (60 MB). É suficiente pra demonstrar valor e cabe em qualquer free tier.

## Como validar os dados

Dados errados numa API de saúde são piores do que nenhum dado. A validação tem 5 camadas:

### 1. Validação na fonte

Só aceitar dados de fontes oficiais verificáveis. Cada dado precisa ser rastreável até a publicação original.

| Fonte | Como verificar autenticidade |
|-------|------------------------------|
| InfoGripe | Comparar com boletim semanal publicado em info.gripe.fiocruz.br |
| SINAN/DATASUS | Comparar com Boletim Epidemiológico do Ministério da Saúde (publicação semanal) |
| IBGE | API oficial — dados idênticos ao censo/estimativas populacionais |
| CID-10 | OMS é a fonte canônica, tradução DATASUS é oficial no Brasil |
| Notificação compulsória | Portaria publicada no Diário Oficial da União (DOU) |
| Mortalidade (SIM) | Publicações do MS/SVS, verificável via TabNet |

### 2. Validação cruzada entre fontes

Cruzar dados de fontes diferentes pra detectar inconsistências:

```
InfoGripe diz: 500 casos de SRAG em SP na SE 10
Boletim do MS diz: 480 casos

Diferença < 10%? → OK. Atraso de notificação é normal em vigilância.
Diferença > 30%? → FLAG. Investigar antes de publicar.
Diferença > 50%? → REJEITAR. Provável erro de ingestão ou mudança de schema.
```

**Por que a diferença existe:** O SINAN tem um ciclo de revisão. Dados da semana atual são preliminares e são revisados nas semanas seguintes. O InfoGripe faz nowcasting (estimativa corrigida) justamente por isso. Diferenças pequenas entre fontes são esperadas e normais.

### 3. Validação estrutural no ETL

Antes de inserir qualquer dado no banco, o script de ingestão deve checar:

| Cheque | O que valida | Ação se falhar |
|--------|-------------|----------------|
| Código IBGE existe na tabela `regioes`? | Município é real | Rejeitar registro |
| Código CID-10 existe na tabela `doencas`? | Doença é válida | Rejeitar registro |
| Semana epidemiológica entre 1 e 53? | Período é válido | Rejeitar registro |
| Ano entre 2000 e ano atual? | Não é dado do futuro ou absurdo | Rejeitar registro |
| Número de casos ≥ 0? | Não tem valor negativo | Rejeitar registro |
| Município tem população > 0? | Taxa de incidência calculável | Flag (pode ser município novo) |
| Soma de casos do estado = soma dos municípios? | Consistência interna | Flag pra revisão |
| Campos obrigatórios preenchidos? | Completude | Rejeitar registro |

### 4. Versionamento e auditoria

Toda ingestão de dados deve ser rastreável:

| Prática | Por quê |
|---------|---------|
| Gravar `fonte`, `data_ingestao`, `versao_arquivo` em cada registro | Saber de onde veio e quando |
| Nunca sobrescrever dados — inserir nova versão e marcar a anterior | Poder comparar e reverter |
| Log de cada execução do ETL com: registros processados, aceitos, rejeitados | Detectar problemas rápido |
| Hash do arquivo fonte (MD5/SHA256) | Garantir que o arquivo não foi corrompido no download |

Exemplo de registro com auditoria:

```json
{
  "municipio_ibge": "355030",
  "cid10": "A90",
  "semana_epi": "2024-SE-10",
  "casos": 142,
  "_meta": {
    "fonte": "SINAN/DATASUS",
    "arquivo": "DENGSP23.parquet",
    "hash_arquivo": "sha256:abc123...",
    "data_ingestao": "2024-03-15T08:00:00Z",
    "versao_etl": "1.2.0"
  }
}
```

### 5. Transparência na API

O profissional de saúde precisa saber as limitações dos dados. Toda resposta com dados epidemiológicos deve incluir:

```json
{
  "data": [...],
  "meta": {
    "fonte": "InfoGripe/Fiocruz",
    "dataReferencia": "2024-SE-10",
    "dataIngestao": "2024-03-15T08:00:00Z",
    "atrasoMedioNotificacao": "2 semanas",
    "nota": "Dados sujeitos a revisão. Semanas recentes podem estar incompletas devido ao atraso de notificação."
  }
}
```

**Por que isso importa:** Em vigilância epidemiológica, os dados das últimas 2-4 semanas são SEMPRE incompletos. Se a API não avisa isso, o profissional pode tomar decisões erradas achando que os casos caíram quando na verdade só não foram notificados ainda.

## Regra de ouro

**Só publicar dado que você consegue rastrear até a fonte oficial.**

Se alguém perguntar "de onde veio esse número?", a resposta precisa ser: "do arquivo X, baixado do DATASUS em Y, processado pelo ETL versão Z". Se não conseguir responder isso, o dado não deve estar na API.

## Custos: tudo no free tier

| Serviço | Free tier | Suficiente? |
|---------|-----------|-------------|
| **Fly.io** (API) | 3 VMs compartilhadas, 256 MB RAM | ✅ pra cenário mínimo e intermediário |
| **Turso** (banco) | 500 databases, 9 GB total | ✅ pra todos os cenários |
| **Neon** (PostgreSQL) | 500 MB, 1 projeto | ✅ pra mínimo, apertado pra intermediário |
| **Supabase** (PostgreSQL) | 500 MB, 2 projetos | ✅ pra mínimo |
| **GitHub Actions** (ETL) | 2.000 min/mês | ✅ script semanal usa ~10 min/mês |
| **Cloudflare Workers** (alternativa) | 100k req/dia | ✅ de sobra |

**Custo total pra rodar o cenário mínimo: R$ 0.**
