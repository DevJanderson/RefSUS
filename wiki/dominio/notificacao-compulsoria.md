# RefSUS — Notificação Compulsória

## O que é

A notificação compulsória é a comunicação obrigatória de doenças e agravos à autoridade de saúde. Todo profissional de saúde é obrigado por lei (Lei nº 6.259/1975) a notificar casos suspeitos ou confirmados de doenças da lista nacional.

## Base legal

- **Portaria GM/MS nº 217/2023** — Lista nacional atualizada
- **Portaria nº 204/2016** — Base anterior
- **Lei nº 6.259/1975** — Obrigatoriedade da notificação

## Tipos de notificação

| Tipo | Prazo | Quando usar |
|------|-------|-------------|
| **Imediata** | Até 24 horas | Doenças de alta gravidade ou potencial epidêmico |
| **Semanal** | Até o encerramento da semana epidemiológica | Doenças endêmicas ou de menor urgência |

## Dados na API

A API contém **57 agravos** de notificação compulsória:

- **30 de notificação imediata** (ex: Cólera, Febre Amarela, Sarampo, Raiva)
- **27 de notificação semanal** (ex: Dengue, Tuberculose, Hanseníase, Sífilis)

Cada agravo está mapeado aos seus **códigos CID-10** correspondentes. Um mesmo código pode aparecer em mais de um agravo (ex: A90 aparece em "Dengue" e "Dengue - óbito").

## Endpoints

### Listar todos os agravos

```
GET /v1/notificacao-compulsoria
GET /v1/notificacao-compulsoria?tipo=imediata
GET /v1/notificacao-compulsoria?tipo=semanal
```

### Verificar um código CID-10

O endpoint mais importante pra o dia a dia:

```
GET /v1/notificacao-compulsoria/verificar/A00
```

Resposta:
```json
{
  "data": {
    "codigo": "A00",
    "notificacaoCompulsoria": true,
    "agravos": [
      {
        "agravo": "Cólera",
        "tipoNotificacao": "imediata"
      }
    ]
  }
}
```

Se o código **não for** de notificação compulsória:
```json
{
  "data": {
    "codigo": "Z99",
    "notificacaoCompulsoria": false,
    "agravos": []
  }
}
```

## Exemplos de uso

### 1. Médico preenchendo prontuário
Diagnosticou um paciente com CID A90. Antes de encerrar o atendimento:
```
GET /v1/notificacao-compulsoria/verificar/A90
→ notificacaoCompulsoria: true, tipo: semanal
```
Sabe que precisa preencher a ficha SINAN de Dengue até o final da semana epidemiológica.

### 2. Sistema de prontuário eletrônico
Ao registrar um diagnóstico com CID-10, o sistema consulta a API automaticamente e alerta o profissional se a notificação é obrigatória:
- Se `imediata` → alerta vermelho, prazo de 24h
- Se `semanal` → alerta amarelo, prazo semanal
- Se `false` → sem alerta

### 3. Vigilância epidemiológica municipal
Listar todos os agravos de notificação imediata pra treinar a equipe:
```
GET /v1/notificacao-compulsoria?tipo=imediata
→ 30 agravos que exigem notificação em até 24h
```

## Agravos de notificação imediata (24h)

| Agravo | CID-10 principal |
|--------|-----------------|
| Cólera | A00 |
| Febre Amarela | A95 |
| Peste | A20 |
| Raiva humana | A82 |
| Sarampo | B05 |
| Rubéola | B06 |
| Poliomielite | A80 |
| Doença meningocócica | A39 |
| Hantavirose | A98.5 |
| Febre Maculosa | A77 |
| Botulismo | A05.1 |
| Chikungunya | A92.0 |
| Zika vírus | U06 |
| Ebola | A98.4 |
| Varíola | B03 |
| Monkeypox (Mpox) | B04 |
| SRAG | J80 |
| Influenza por novo subtipo | J09 |

## Agravos de notificação semanal

| Agravo | CID-10 principal |
|--------|-----------------|
| Dengue | A90/A91 |
| Tuberculose | A15-A19 |
| Hanseníase | A30 |
| Hepatites virais | B15-B19 |
| HIV/AIDS | B20-B24 |
| Sífilis | A50-A53 |
| Malária | B50-B54 |
| Leptospirose | A27 |
| Leishmaniose | B55 |
| Coqueluche | A37 |
| Esquistossomose | B65 |
| Covid-19 | U07 |

## Observações

- A lista pode ser atualizada por novas Portarias do Ministério da Saúde
- Alguns agravos têm notificação dual (ex: Dengue é semanal, mas Dengue-óbito é imediata)
- Malária é semanal na Amazônia mas imediata fora dela
- Os dados na API refletem a Portaria GM/MS nº 217/2023
