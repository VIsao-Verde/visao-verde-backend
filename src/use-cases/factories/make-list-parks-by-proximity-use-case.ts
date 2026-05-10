import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { ListParksByProximityUseCase } from '@use-cases/parks/list-parks-by-proximity.js'

export function makeListParksByProximityUseCase() {
  const parksRepository = new PrismaParksRepository()
  const listParksByProximityUseCase = new ListParksByProximityUseCase(parksRepository)

  return listParksByProximityUseCase
}
