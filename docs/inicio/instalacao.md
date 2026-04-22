# Instalação

## Requisitos

- Node.js 20+
- pnpm 10+

## Instalar e rodar

```bash
git clone https://github.com/DevJanderson/RefSUS.git
cd RefSUS
pnpm install
pnpm dev:api
```

A API sobe em **http://localhost:8003** e a documentação interativa em **http://localhost:8003/docs**.

No primeiro start, o seed carrega automaticamente os CSVs em `packages/api/data/` pro SQLite local.

## Reset do banco

Pra forçar o seed de novo:

```bash
rm packages/api/data/referencia.db
pnpm dev:api
```

## Próximo passo

[Primeiros passos](primeiros-passos.md) — faça sua primeira requisição.
