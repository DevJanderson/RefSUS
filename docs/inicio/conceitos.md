# Conceitos

Entender isso poupa tempo.

## Envelope de resposta

Toda resposta de lista vem encapsulada:

```json
{
  "data": [...],
  "meta": {
    "total": 2045,
    "limit": 20,
    "offset": 0
  }
}
```

Respostas únicas (`/codigo/A90`) retornam apenas `{ data: {...} }`.

## Convenção PT-BR

Endpoints, nomes de tabela e colunas estão em português:

- `/v1/doencas`, não `/diseases`
- `codigo`, `nome`, `capitulo`, não `code`, `name`, `chapter`

Isso é deliberado — o público é profissional de saúde brasileiro. Veja [ADR 0003](../../wiki/adr/0003-ptbr-em-api-publica.md).

## Versionamento

Todos os endpoints estão em `/v1/`. Mudanças breaking bumpam pra `/v2/`. Veja [Versionamento](../referencia/versionamento.md).

## Cache e rate limit

- Respostas têm cache de 1h (`Cache-Control: public, max-age=3600`)
- Limite de 60 requests/minuto por IP

Detalhes em [Cache](../referencia/cache.md) e [Rate limiting](../referencia/rate-limiting.md).

## Dados de referência vs epidemiológicos

**Hoje:** a API serve apenas dados de **referência** (CID-10, IBGE, notificação compulsória) — estáticos, mudam raramente.

**Futuro:** dados **epidemiológicos** (casos por semana, tendências) — em roadmap, ver [`wiki/roadmap/`](../../wiki/roadmap/).
