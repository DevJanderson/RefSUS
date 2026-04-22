# Changelog de dados

Quando e por que cada dataset foi atualizado. Separado do [`CHANGELOG.md`](../../CHANGELOG.md) da aplicação porque **dado e código têm ciclos diferentes**.

## Formato

```
## AAAA-MM-DD — <dataset>
Fonte: <URL ou descrição>
Motivo: <atualização periódica | correção | nova versão da portaria>
Hash do arquivo: <sha256 opcional>
Notas: <diferenças relevantes vs versão anterior>
```

## Histórico

### 2026-04 — carga inicial

Todos os datasets carregados da versão vigente:

| Dataset | Fonte | Data de referência |
|---------|-------|-------------------|
| CID-10 doenças | OMS via tradução DATASUS | Revisão 2008 |
| CID-10 sintomas (R00-R99) | Cap. XVIII CID-10 | Revisão 2008 |
| Regiões IBGE | API IBGE Localidades | 2024 |
| Agravos de notificação | Portaria GM/MS nº 217/2023 | 2023-03-01 |
