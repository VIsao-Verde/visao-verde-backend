import { ListParksUseCase } from '@use-cases/parks/list-parks.js'
import { PrismaParksRepository } from '@/repositories/prisma/prisma-parks-repository.js'

export function makeListParksUseCase() {
  const parksRepository = new PrismaParksRepository()
  const listParksUseCase = new ListParksUseCase(parksRepository)

  return listParksUseCase
}
