import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { FindParkUseCase } from '@use-cases/parks/find-park.js'

export function makeFindParkUseCase() {
  const parksRepository = new PrismaParksRepository()
  const findParkUseCase = new FindParkUseCase(parksRepository)

  return findParkUseCase
}
