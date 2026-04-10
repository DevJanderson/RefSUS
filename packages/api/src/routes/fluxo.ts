import { readFileSync } from 'node:fs'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

const fluxoData = JSON.parse(readFileSync('data/fluxo_notificacao.json', 'utf-8'))

const app = new OpenAPIHono()

// ── FONTES OFICIAIS ───────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/fontes',
    tags: ['Fluxo de Notificação'],
    summary: 'Official legal sources and references',
    responses: {
      200: {
        description: 'List of legal documents and official sources',
        content: {
          'application/json': {
            schema: z.object({
              data: z.array(
                z.object({
                  documento: z.string(),
                  descricao: z.string(),
                  url: z.string(),
                }),
              ),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({ data: fluxoData.fontes }),
)

// ── SISTEMAS OFICIAIS ─────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/sistemas',
    tags: ['Fluxo de Notificação'],
    summary: 'Official notification systems (SINAN, e-SUS, GAL, CIEVS)',
    responses: {
      200: {
        description: 'List of official health information systems',
        content: {
          'application/json': {
            schema: z.object({
              data: z.record(z.string(), z.any()),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({ data: fluxoData.sistemas }),
)

// ── FICHAS ────────────────────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/fichas',
    tags: ['Fluxo de Notificação'],
    summary: 'Official notification forms (FIN, investigation forms)',
    responses: {
      200: {
        description: 'Required forms and their mandatory fields',
        content: {
          'application/json': {
            schema: z.object({
              data: z.record(z.string(), z.any()),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({ data: fluxoData.fichas }),
)

// ── CADEIA DE NOTIFICAÇÃO ─────────────────────────────────────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/cadeia',
    tags: ['Fluxo de Notificação'],
    summary: 'Notification chain (facility → municipal → state → federal)',
    responses: {
      200: {
        description: 'Hierarchical notification chain',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                descricao: z.string(),
                niveis: z.array(
                  z.object({
                    nivel: z.number(),
                    nome: z.string(),
                    responsavel: z.string(),
                    acao: z.string(),
                  }),
                ),
              }),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({ data: fluxoData.cadeia_notificacao }),
)

// ── FLUXO POR TIPO (must be last — /{tipo} is catch-all) ─────────────────────

app.openapi(
  createRoute({
    method: 'get',
    path: '/{tipo}',
    tags: ['Fluxo de Notificação'],
    summary: 'Get step-by-step notification workflow by type',
    request: {
      params: z.object({
        tipo: z.enum(['imediata', 'semanal']).openapi({ example: 'imediata' }),
      }),
    },
    responses: {
      200: {
        description: 'Notification workflow steps with legal references',
        content: {
          'application/json': {
            schema: z.object({
              data: z.object({
                tipo: z.string(),
                prazo: z.string(),
                baseLegal: z.string(),
                passos: z.array(
                  z.object({
                    ordem: z.number(),
                    acao: z.string(),
                    responsavel: z.string(),
                    detalhes: z.string(),
                    prazo: z.string().optional(),
                    baseLegal: z.string().optional(),
                    formulario: z.string().optional(),
                    sistema: z.string().optional(),
                  }),
                ),
              }),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    const { tipo } = c.req.valid('param')
    const fluxo = fluxoData.fluxos[tipo]

    return c.json({
      data: {
        tipo: fluxo.tipo,
        prazo: fluxo.prazo,
        baseLegal: fluxo.base_legal,
        passos: fluxo.passos.map((p: Record<string, unknown>) => {
          const step: Record<string, unknown> = {
            ordem: p.ordem,
            acao: p.acao,
            responsavel: p.responsavel,
            detalhes: p.detalhes,
          }
          if (p.prazo) step.prazo = p.prazo
          if (p.base_legal) step.baseLegal = p.base_legal
          if (p.formulario) step.formulario = p.formulario
          if (p.sistema) step.sistema = p.sistema
          return step
        }),
      },
    })
  },
)

export default app
