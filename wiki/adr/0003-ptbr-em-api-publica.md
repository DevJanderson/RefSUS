# 0003 — PT-BR em API pública

- **Status:** Accepted
- **Data:** 2026-04
- **Autor(es):** DevJanderson

## Contexto

Convenção universal de APIs REST em projetos brasileiros é usar inglês (`/diseases`, `/regions`). Razão histórica: maior parte dos devs aprende com doc em inglês, e "profissional" é associado a inglês.

Mas: o **público-alvo** do RefSUS é **profissional de saúde brasileiro** — equipes de vigilância epidemiológica dos 5.570 municípios, desenvolvedores construindo sistemas pra prontuários públicos, pesquisadores em saúde coletiva. O dado é brasileiro (CID-10 traduzido pelo DATASUS, IBGE, Portaria GM/MS).

Campos em inglês forçariam o consumidor a traduzir mentalmente toda resposta. `disease.name` vira barreira; `doenca.nome` não.

## Decisão

**Português do Brasil** em toda a superfície pública:

- **Rotas**: `/v1/doencas`, `/v1/regioes`, `/v1/notificacao-compulsoria`
- **Tabelas**: `doencas`, `regioes`, `agravos`
- **Colunas**: `codigo`, `nome`, `capitulo`, `tipo_notificacao`
- **Valores de enum**: `"imediata"`, `"semanal"`
- **Mensagens de erro**: PT-BR com sugestão prática

Inglês permanece onde é **invisível ao consumidor**:
- Nomes de variáveis locais em TypeScript
- Tipos helper internos
- Libs e ecosystem (imports, configs)
- Nomes de arquivo de código (`doencas.ts` ok, mas `schema.ts` também ok)

## Consequências

### Positivas
- Profissional de saúde lê a resposta e entende **na hora**
- Doc oficial (Portaria, CID-10 DATASUS) mapeia 1:1 com a API
- Erros em PT-BR são acionáveis pelo público-alvo
- Diferencial vs BrasilAPI, que é PT-BR também (escolha alinhada com o ecossistema brasileiro de dados públicos)

### Negativas
- Dev internacional precisa traduzir pra entender (aceito — projeto é nacional por natureza)
- Code review inicial estranha (vira natural rápido)
- Ferramentas autogeradas em inglês (ex: Scalar UI) misturam idiomas

### Neutras
- Busca no Google por nomes em PT-BR pode trazer menos referências técnicas (mas estamos criando a referência)

## Alternativas consideradas

### Inglês em tudo
"Padrão universal". Mas contraria público-alvo. Descartado.

### Inglês com campos aliased em PT-BR
Dobra o peso do payload, confunde qual é o canônico. Descartado.

### PT-BR opcional via header `Accept-Language`
Complica contrato, dobra testes. Descartado. (Reconsiderar se surgir demanda real.)

## Referências

- BrasilAPI usa PT-BR: https://brasilapi.com.br
- IBGE Localidades API usa PT-BR
- Invariante registrado em [`../INVARIANTES.md`](../INVARIANTES.md)
