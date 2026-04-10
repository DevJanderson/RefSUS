import { jwt } from 'hono/jwt'
import { env } from '../env'

// Em produção com RS256: jwt({ secret: env.JWT_PUBLIC_KEY, alg: 'RS256' })
// Em dev com HS256 pra facilitar testes:
export const authMiddleware = jwt({ secret: env.JWT_PUBLIC_KEY, alg: 'HS256' })
