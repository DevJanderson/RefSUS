# Integrar com Python

## Requisição básica

```python
import requests

BASE = "http://localhost:8003/v1"

r = requests.get(f"{BASE}/doencas/codigo/A90")
data = r.json()["data"]
print(data["nome"])  # "Dengue [dengue clássico]"
```

## Verificar notificação compulsória

```python
r = requests.get(f"{BASE}/notificacao-compulsoria/verificar/A90")
data = r.json()["data"]

if data["notificacaoCompulsoria"]:
    agravo = data["agravos"][0]
    print(f"Notificar: {agravo['agravo']} ({agravo['tipoNotificacao']})")
```

## Busca com filtros

```python
r = requests.get(f"{BASE}/doencas", params={"q": "dengue", "limit": 5})
for d in r.json()["data"]:
    print(f"{d['codigo']} - {d['nome']}")
```

## Municípios de um estado

```python
r = requests.get(f"{BASE}/regioes/estados/SP/municipios", params={"limit": 100})
resultado = r.json()
print(f"Total: {resultado['meta']['total']}")
for m in resultado["data"]:
    print(f"{m['codigo_ibge']} - {m['nome']}")
```

## Integração com pandas

```python
import pandas as pd

r = requests.get(f"{BASE}/regioes/estados/SP/municipios", params={"limit": 1000})
df = pd.DataFrame(r.json()["data"])
```
