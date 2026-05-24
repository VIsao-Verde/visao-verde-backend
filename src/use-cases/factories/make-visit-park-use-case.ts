import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaUserVisitedParksRepository } from '@repositories/prisma/prisma-user-visited-parks-repository.js'
import { VisitParkUseCase } from '@use-cases/visits/visit-park.js'

export function makeVisitParkUseCase() {
  const userVisitedParksRepository = new PrismaUserVisitedParksRepository()
  const parksRepository = new PrismaParksRepository()
  const visitParkUseCase = new VisitParkUseCase(userVisitedParksRepository, parksRepository)

  return visitParkUseCase
}
