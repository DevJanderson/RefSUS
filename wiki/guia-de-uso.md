# RefSUS — Guia de Uso

## Instalação local

```bash
# Clonar e instalar
git clone <repo-url>
cd refsus
pnpm install

# Rodar (seed automático no primeiro start)
pnpm dev
# → http://localhost:8003
# → http://localhost:8003/docs (documentação interativa)
```

## Casos de uso comuns

### 1. Buscar uma doença pelo código CID-10

```bash
curl http://localhost:8003/v1/doencas/codigo/A90
```

### 2. Buscar uma doença pelo nome

```bash
curl "http://localhost:8003/v1/doencas?q=dengue"
```

### 3. Verificar se precisa notificar

```bash
curl http://localhost:8003/v1/notificacao-compulsoria/verificar/A90
```

### 4. Autocomplete pra campo de busca

```bash
curl "http://localhost:8003/v1/doencas/autocomplete?q=tub&limit=5"
```

### 5. Listar municípios de um estado

```bash
curl "http://localhost:8003/v1/regioes/estados/SP/municipios?limit=10"
```

### 6. Buscar município pelo código IBGE

```bash
curl http://localhost:8003/v1/regioes/ibge/3550308
```

### 7. Listar capítulos CID-10

```bash
curl http://localhost:8003/v1/doencas/capitulos
```

### 8. Filtrar doenças por capítulo

```bash
curl "http://localhost:8003/v1/doencas?capitulo=I%20-%20Algumas%20doen%C3%A7as%20infecciosas%20e%20parasit%C3%A1rias"
```

### 9. Ver estatísticas gerais

```bash
curl http://localhost:8003/v1/stats
```

### 10. Listar agravos de notificação imediata

```bash
curl "http://localhost:8003/v1/notificacao-compulsoria?tipo=imediata"
```

## Integrando num sistema

### JavaScript/TypeScript

```typescript
const BASE = 'http://localhost:8003/v1'

// Verificar notificação compulsória
async function verificarNotificacao(cid: string) {
  const res = await fetch(`${BASE}/notificacao-compulsoria/verificar/${cid}`)
  const { data } = await res.json()
  return data
}

// Autocomplete de doenças
async function buscarDoencas(query: string) {
  const res = await fetch(`${BASE}/doencas/autocomplete?q=${query}&limit=10`)
  const { data } = await res.json()
  return data
}

// Municípios de um estado
async function municipios(uf: string) {
  const res = await fetch(`${BASE}/regioes/estados/${uf}/municipios?limit=100`)
  const { data, meta } = await res.json()
  return { municipios: data, total: meta.total }
}
```

### Python

```python
import requests

BASE = "http://localhost:8003/v1"

# Verificar notificação
r = requests.get(f"{BASE}/notificacao-compulsoria/verificar/A90")
data = r.json()["data"]
print(f"Compulsória: {data['notificacaoCompulsoria']}")

# Buscar doenças
r = requests.get(f"{BASE}/doencas", params={"q": "dengue", "limit": 5})
for d in r.json()["data"]:
    print(f"{d['codigo']} - {d['nome']}")
```

## Rate limiting

- **60 requests por minuto** por IP
- Headers de resposta indicam uso: `RateLimit-Remaining`
- Se exceder: HTTP 429 com mensagem de erro

## Cache

- Respostas de `/v1/*` têm cache de **1 hora** (`Cache-Control: public, max-age=3600`)
- Dados de referência raramente mudam — aproveite o cache
- Pra forçar refresh, use `Cache-Control: no-cache` no request
