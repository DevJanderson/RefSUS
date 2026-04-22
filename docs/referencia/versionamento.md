# Versionamento

## Política

Seguimos **semver** adaptado pra API pública:

- **Path versioning**: todos os endpoints em `/v1/...`
- **Breaking changes** bumpam a versão do path (`/v2/...`)
- **Aditivas** (campo novo, endpoint novo) não bumpam — ficam em `/v1/`
- Versões antigas ficam no ar por no mínimo **12 meses** após deprecation

## O que é breaking

- Remover endpoint
- Remover campo de resposta
- Renomear campo
- Mudar tipo de campo
- Adicionar parâmetro obrigatório

## O que NÃO é breaking

- Adicionar endpoint
- Adicionar campo de resposta (clientes devem ignorar desconhecidos)
- Adicionar parâmetro **opcional**
- Mudar mensagem de erro textual (não o `code`)

## Deprecation

Endpoint deprecated inclui header:

```
Sunset: Wed, 01 Jan 2027 00:00:00 GMT
Deprecation: true
Link: </v2/...>; rel="successor-version"
```

## Versão atual

**v1** — em desenvolvimento, ainda sem release oficial. Veja [`../../CHANGELOG.md`](../../CHANGELOG.md).
