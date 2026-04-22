# RefSUS — Dados e Fontes Oficiais

## Datasets

| Dataset | Registros | Fonte | Arquivo |
|---------|-----------|-------|---------|
| Doenças CID-10 | 2.045 | OMS / DATASUS | `data/doencas.csv` |
| Sintomas CID-10 | 387 | Cap. XVIII CID-10 (R00-R99) | `data/sintomas.csv` |
| Regiões IBGE | 5.598 | IBGE Localidades | `data/regioes.csv` |
| Notificação Compulsória | 57 agravos | Portaria GM/MS nº 217/2023 | `data/notificacao_compulsoria.csv` |

## Estrutura dos CSVs

### doencas.csv
```
codigo,nome,capitulo,categoria
A00,Cólera,I - Algumas doenças infecciosas e parasitárias,A00-A09 Doenças infecciosas intestinais
```

### sintomas.csv
```
codigo,nome
R00,Anormalidades do batimento cardíaco
```

### regioes.csv
```
codigo_ibge,nome,tipo,uf,estado
3550308,São Paulo,municipio,SP,São Paulo
```

### notificacao_compulsoria.csv
```
agravo,codigos_cid10,tipo_notificacao
Dengue,A90;A91,semanal
Cólera,A00;A00.0;A00.1;A00.9,imediata
```

## Fontes oficiais

- **CID-10**: Organização Mundial da Saúde (OMS) — tradução DATASUS
  - https://www.who.int/classifications/icd/en/
  - http://www.datasus.gov.br/cid10/V2008/cid10.htm

- **IBGE Localidades**: Instituto Brasileiro de Geografia e Estatística
  - https://servicodados.ibge.gov.br/api/docs/localidades

- **Notificação Compulsória**: Ministério da Saúde
  - Portaria GM/MS nº 217, de 1º de março de 2023
  - https://www.gov.br/saude/pt-br/composicao/svsa/notificacao-compulsoria

## Atualização dos dados

Os dados são estáticos e carregados via CSV no startup. Para atualizar:

1. Substituir o CSV correspondente em `data/`
2. Deletar o banco (`data/referencia.db`)
3. Reiniciar o server — o seed roda automaticamente se as tabelas estiverem vazias

Em produção, a atualização seria feita via migration + re-seed.
