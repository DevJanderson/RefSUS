# Runbooks

Procedimentos pra **quando algo quebra** ou **operação rotineira crítica**. Passo a passo objetivo, testado.

## Conteúdo

- [Rotacionar secrets](rotacionar-secrets.md)
- [Reingestão de dados](reingestao-dados.md)
- [Rollback](rollback.md)

## Formato de um runbook

Um runbook **não explica o porquê** — explica **o que fazer**. Contexto profundo fica em `arquitetura/` ou `adr/`.

```
# <Problema ou rotina>

## Sintomas
Como identificar que precisa rodar este runbook.

## Pré-requisitos
Acessos, ferramentas.

## Passos
1. ...
2. ...
3. ...

## Verificação
Como confirmar que resolveu.

## Escalation
Quem chamar se não resolver.
```

## Quando escrever runbook

- Rotina que mais de uma pessoa precisa fazer (onboarding)
- Incidente que aconteceu e pode repetir
- Operação crítica que o mantainer faz de cabeça (documentar antes de férias)
