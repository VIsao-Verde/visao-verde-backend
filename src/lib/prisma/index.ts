import { env } from '@env/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/@types/prisma/client.js'

const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query', 'info'] : [],
})
