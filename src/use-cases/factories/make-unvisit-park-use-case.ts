import { PrismaUserVisitedParksRepository } from '@repositories/prisma/prisma-user-visited-parks-repository.js'
import { UnvisitParkUseCase } from '@use-cases/visits/unvisit-park.js'

export function makeUnvisitParkUseCase() {
  const userVisitedParksRepository = new PrismaUserVisitedParksRepository()
  const unvisitParkUseCase = new UnvisitParkUseCase(userVisitedParksRepository)

  return unvisitParkUseCase
}
