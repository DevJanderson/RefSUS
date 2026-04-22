# Rate Limiting

## Limite atual

**60 requisições por minuto por IP.**

## Headers de resposta

Cada resposta inclui:

```
RateLimit-Limit: 60
RateLimit-Remaining: 58
RateLimit-Reset: 42
```

- `Limit` — máximo por janela
- `Remaining` — quantas ainda pode fazer na janela atual
- `Reset` — segundos até a janela reiniciar

## Ao exceder

**HTTP 429 Too Many Requests:**

```json
{
  "error": {
    "message": "Rate limit excedido. Tente novamente em 42 segundos.",
    "retryAfter": 42
  }
}
```

## Boas práticas

- Respeite `RateLimit-Remaining` — pause antes de zerar
- Aproveite o [cache de 1h](cache.md) em dados de referência
- Pra volume alto: contate o mantainer pra whitelist ou chave API (não implementado ainda)
