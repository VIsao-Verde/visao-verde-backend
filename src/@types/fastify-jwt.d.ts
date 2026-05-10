import '@fastify/jwt'
import { UserRole } from '@/@types/prisma/enums.js'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      role: UserRole
      sub: string
    }
  }
}
