# Verificar notificação compulsória

Caso de uso mais frequente: dado um CID-10, saber se precisa notificar.

## Endpoint

```
GET /v1/notificacao-compulsoria/verificar/{codigo}
```

## Exemplo — dengue (notificação semanal)

```bash
curl http://localhost:8003/v1/notificacao-compulsoria/verificar/A90
```

```json
{
  "data": {
    "codigo": "A90",
    "notificacaoCompulsoria": true,
    "agravos": [
      { "agravo": "Dengue", "tipoNotificacao": "semanal" }
    ]
  }
}
```

## Exemplo — cólera (notificação imediata)

```bash
curl http://localhost:8003/v1/notificacao-compulsoria/verificar/A00
```

```json
{
  "data": {
    "codigo": "A00",
    "notificacaoCompulsoria": true,
    "agravos": [
      { "agravo": "Cólera", "tipoNotificacao": "imediata" }
    ]
  }
}
```

## Exemplo — código sem notificação

```bash
curl http://localhost:8003/v1/notificacao-compulsoria/verificar/Z99
```

```json
{
  "data": {
    "codigo": "Z99",
    "notificacaoCompulsoria": false,
    "agravos": []
  }
}
```

## Integração em prontuário eletrônico

Ao registrar CID-10 num prontuário, consulte a API e alerte:

- `tipoNotificacao: "imediata"` → alerta vermelho, prazo 24h
- `tipoNotificacao: "semanal"` → alerta amarelo, prazo semana epidemiológica
- `notificacaoCompulsoria: false` → sem alerta

## Base legal e lista completa

Portaria GM/MS nº 217/2023 — 57 agravos (30 imediatas, 27 semanais). Lista em [`wiki/dominio/notificacao-compulsoria.md`](../../wiki/dominio/notificacao-compulsoria.md).
