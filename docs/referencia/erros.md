# Erros

## Formato

Todo erro segue:

```json
{
  "error": {
    "message": "Descrição em português",
    "code": "identificador_opcional"
  }
}
```

## Códigos HTTP

| Status | Quando |
|--------|--------|
| `400` | Parâmetros inválidos (ex: `limit` não numérico) |
| `404` | Recurso não encontrado (ex: código CID-10 inexistente) |
| `422` | Validação Zod falhou — payload com detalhe do campo |
| `429` | Rate limit excedido — ver [Rate limiting](rate-limiting.md) |
| `500` | Erro interno — reportar como bug |

## Exemplo — 422 de validação

```json
{
  "error": {
    "message": "Parâmetros inválidos",
    "code": "validation_error",
    "issues": [
      { "path": ["limit"], "message": "Expected number, got string" }
    ]
  }
}
```

## Exemplo — 404

```json
{
  "error": {
    "message": "Código CID-10 não encontrado",
    "code": "not_found"
  }
}
```
