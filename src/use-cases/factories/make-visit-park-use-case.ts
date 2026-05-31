import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaUserVisitedParksRepository } from '@repositories/prisma/prisma-user-visited-parks-repository.js'
import { VisitParkUseCase } from '@use-cases/visits/visit-park.js'
import { makeCheckAndGrantConquestsUseCase } from '@use-cases/factories/make-check-and-grant-conquests-use-case.js'

export function makeVisitParkUseCase() {
  const userVisitedParksRepository = new PrismaUserVisitedParksRepository()
  const parksRepository = new PrismaParksRepository()
  const checkAndGrantConquestsUseCase = makeCheckAndGrantConquestsUseCase()
  const visitParkUseCase = new VisitParkUseCase(userVisitedParksRepository, parksRepository, checkAndGrantConquestsUseCase)

  return visitParkUseCase
}
