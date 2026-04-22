# RefSUS — Invariantes

Regras duras. Se algo aqui parece errado, **pergunte antes de mudar** — cada regra existe por um motivo listado.

## Naming e linguagem

- **PT-BR em tudo que é público**: rotas (`/doencas`, `/regioes`), tabelas (`doencas`, `regioes`), colunas (`codigo`, `nome`, `capitulo`), agravos (`"Febre Amarela"`).
  - **Por quê:** público-alvo é profissional de saúde brasileiro. Inglês vira barreira, não ponte.
- Código TS interno pode usar inglês (variáveis locais, tipos helpers). A fronteira é a **API e o banco**.
- Mensagens de erro da API: PT-BR, com sugestão prática.

## Envelope de resposta

- Toda resposta de lista: `{ data: [...], meta: {...} }`.
- `meta` sempre inclui ao menos `total` em listas paginadas.
- **Dados epidemiológicos** (quando existirem): `meta.fonte`, `meta.dataReferencia`, `meta.dataIngestao` são **obrigatórios**. Sem isso, o endpoint **não deve ir pra produção**.
  - **Por quê:** dado epidemiológico sem data de referência leva profissional a decisão errada (ver `wiki/roadmap/volume-e-validacao.md`).

## Rastreabilidade

- **Nenhum dado entra no banco sem fonte oficial rastreável.**
  - CID-10 → OMS / DATASUS
  - IBGE → API oficial de Localidades
  - Notificação compulsória → Portaria GM/MS citada no registro
  - Dados epidemiológicos (futuro) → InfoGripe, SINAN, SIM com hash do arquivo
- Ao adicionar dataset novo: atualizar `wiki/dominio/dados-e-fontes.md` **no mesmo commit**.

## Schema e testes

- Mudança em schema Zod ou Drizzle → **Vitest precisa passar** antes de commit.
- Testes de integração usam **SQLite em memória**, não mock. Não introduzir mock de DB.
  - **Por quê:** divergência mock/prod esconde bugs de migration.
- Mudança em rota OpenAPI → conferir que `/docs` (Scalar) renderiza sem erro.

## Ingestão e imutabilidade de dados

- **Nunca sobrescrever dados ingeridos** — inserir nova versão com `_meta.versao_etl` e marcar anterior.
- Toda execução de ETL grava log com: registros processados, aceitos, rejeitados, hash do arquivo fonte.
- Rejeitar registro cujo município/CID-10 não exista nas tabelas de referência.

## Rate limit e cache

- Rate limit atual: **60 req/min por IP**. Só aumentar com justificativa documentada.
- Cache de `/v1/*`: **1 hora** (`Cache-Control: public, max-age=3600`). Dados de referência mudam raramente.

## Status de docs

- Docs em `wiki/dominio/` e `wiki/arquitetura/` descrevem o **que existe hoje**.
- Docs em `wiki/roadmap/` descrevem **futuro (🔮)** — não são contrato, são direção.
- Antes de implementar algo de `roadmap/`: confirmar com o usuário que virou prioridade.

## O que NUNCA fazer

- ❌ Renomear endpoint/tabela PT-BR pra inglês
- ❌ Remover `meta` de resposta de lista
- ❌ Adicionar Python, Rust ou outra linguagem ao monorepo sem discussão (hoje é TS puro)
- ❌ Mockar banco em teste de integração
- ❌ Publicar dado sem rastreabilidade
- ❌ Committar com `pnpm lint` ou `pnpm test` falhando
- ❌ Implementar item de `wiki/roadmap/` sem confirmação

## Quando adicionar invariante aqui

Regra só entra aqui se:
1. Já foi violada uma vez e causou dor, **ou**
2. É consequência direta de lei/portaria (base legal), **ou**
3. É decisão arquitetural que, se revertida, quebra contrato público.

Preferência vaga não vira invariante.
