import { z } from '@hono/zod-openapi'

export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100).openapi({ example: 100 }),
  offset: z.coerce.number().int().min(0).default(0).openapi({ example: 0 }),
})

export const SearchQuery = z.object({
  q: z.string().min(2).optional().openapi({ description: 'Search term (min 2 chars)' }),
  limit: z.coerce.number().int().min(1).max(50).default(10).openapi({ example: 10 }),
})

export function metaSchema() {
  return z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  })
}

export function listResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: metaSchema(),
  })
}

export const ErrorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      status: z.number(),
    }),
  })
  .openapi('Error')
