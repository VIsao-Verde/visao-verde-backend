import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/@types/prisma/client.js'
import { env } from '../src/env/index.js'

const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
export const prisma = new PrismaClient({
  adapter,
})

const CONQUESTS = [
  { key: 'FIRST_VISIT', name: 'Primeiro Passo', description: 'Visite o seu primeiro parque.' },
  { key: 'VISITED_5_PARKS', name: 'Explorador Iniciante', description: 'Visite 5 parques diferentes.' },
  { key: 'VISITED_10_PARKS', name: 'Explorador Veterano', description: 'Visite 10 parques diferentes.' },
  { key: 'VISITED_25_PARKS', name: 'Mochileiro Verde', description: 'Visite 25 parques diferentes.' },
  { key: 'FIRST_FAVORITE', name: 'Amante da Natureza', description: 'Adicione o seu primeiro parque aos favoritos.' },
  { key: 'FAVORITED_5_PARKS', name: 'Colecionador Verde', description: 'Adicione 5 parques aos favoritos.' },
  { key: 'FIRST_REVIEW', name: 'Crítico Ambiental', description: 'Escreva a sua primeira avaliação.' },
  { key: 'REVIEWED_5_PARKS', name: 'Voz da Natureza', description: 'Escreva avaliações para 5 parques.' },
  { key: 'VISITED_3_CITIES', name: 'Viajante Urbano', description: 'Visite parques em 3 cidades diferentes.' },
  { key: 'ALL_ROUNDER', name: 'Aventureiro Completo', description: 'Visite 5 parques, favorite 3 e escreva 1 avaliação.' },
]

export async function seed() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      username: 'Admin',
      email: 'admin@example.com',
      cpf: '111.111.111-11',
      // password: 'ybp_whf3wxn2xdr6MTE'
      passwordHash: '$2a$12$y7AWvv8D1P9AVn2G8XkNZOXyrMZ658QFJyR.2kxM.oP/wmgB/.7.2',
      role: 'ADMIN',
    },
  })

  for (const conquest of CONQUESTS) {
    await prisma.conquest.upsert({
      where: { key: conquest.key },
      update: { name: conquest.name, description: conquest.description },
      create: conquest,
    })
  }
}

seed()
  .then(() => {
    console.log('Seeding completed successfully.')
    prisma.$disconnect()
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error during seeding:', error)
    prisma.$disconnect()
    process.exit(1)
  })
