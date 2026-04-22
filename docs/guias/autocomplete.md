# Autocomplete em formulários

Pra campos de busca em tempo real (doenças, sintomas, municípios).

## Endpoints de autocomplete

| Recurso | Endpoint |
|---------|----------|
| Doenças | `GET /v1/doencas/autocomplete?q=&limit=` |
| Sintomas | `GET /v1/sintomas/autocomplete?q=&limit=` |
| Municípios | `GET /v1/regioes/municipios/autocomplete?q=&limit=` |

## Exemplo — doenças

```bash
curl "http://localhost:8003/v1/doencas/autocomplete?q=tub&limit=5"
```

Retorna no máximo `limit` resultados, ordenados por relevância.

## Boas práticas no cliente

- **Debounce** de 200–300ms entre tecla e request
- **Mínimo 2 caracteres** antes de disparar
- **Abortar request anterior** quando usuário digita rápido (`AbortController`)
- **Cache local** — as respostas têm `Cache-Control: max-age=3600`, use

## Exemplo TypeScript com debounce

```typescript
let controller: AbortController | null = null

async function autocompleteDoencas(q: string) {
  if (q.length < 2) return []
  controller?.abort()
  controller = new AbortController()

  const res = await fetch(
    `http://localhost:8003/v1/doencas/autocomplete?q=${encodeURIComponent(q)}&limit=10`,
    { signal: controller.signal }
  )
  const { data } = await res.json()
  return data
}
```
