# Integrar com JavaScript / TypeScript

## Requisição básica

```typescript
const BASE = 'http://localhost:8003/v1'

const res = await fetch(`${BASE}/doencas/codigo/A90`)
const { data } = await res.json()
console.log(data.nome) // "Dengue [dengue clássico]"
```

## Verificar notificação compulsória

```typescript
async function verificarNotificacao(cid: string) {
  const res = await fetch(`${BASE}/notificacao-compulsoria/verificar/${cid}`)
  const { data } = await res.json()
  return data
}

const resultado = await verificarNotificacao('A90')
if (resultado.notificacaoCompulsoria) {
  console.log(`Notificar: ${resultado.agravos[0].agravo} (${resultado.agravos[0].tipoNotificacao})`)
}
```

## Autocomplete

```typescript
async function buscarDoencas(query: string) {
  const res = await fetch(`${BASE}/doencas/autocomplete?q=${encodeURIComponent(query)}&limit=10`)
  const { data } = await res.json()
  return data
}
```

## Municípios de um estado

```typescript
async function municipios(uf: string) {
  const res = await fetch(`${BASE}/regioes/estados/${uf}/municipios?limit=100`)
  const { data, meta } = await res.json()
  return { municipios: data, total: meta.total }
}
```

## Tipos (opcional)

```typescript
type Envelope<T> = { data: T; meta?: { total: number; limit: number; offset: number } }

type Doenca = {
  codigo: string
  nome: string
  capitulo: string
  categoria: string
}
```

Em produção, recomendamos gerar tipos a partir do OpenAPI em `/openapi.json`.
