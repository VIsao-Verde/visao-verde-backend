import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { AddParkUseCase } from '@use-cases/parks/add-park.js'

export function makeAddParkUseCase() {
  const parksRepository = new PrismaParksRepository()
  const addParkUseCase = new AddParkUseCase(parksRepository)

  return addParkUseCase
}