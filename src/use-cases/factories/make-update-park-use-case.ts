import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { UpdateParkUseCase } from '@use-cases/parks/update-park.js'

export function makeUpdateParkUseCase() {
  const parksRepository = new PrismaParksRepository()
  const updateParkUseCase = new UpdateParkUseCase(parksRepository)

  return updateParkUseCase
}
