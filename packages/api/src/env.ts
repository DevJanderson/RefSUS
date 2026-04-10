import 'dotenv/config'
import { z } from 'zod/v4'

const envSchema = z.object({
  PORT: z.coerce.number().default(8003),
  DATABASE_URL: z.string().default('data/referencia.db'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_PUBLIC_KEY: z.string().default('dev-secret-for-hs256-testing-only!!'),
})

export const env = envSchema.parse(process.env)
