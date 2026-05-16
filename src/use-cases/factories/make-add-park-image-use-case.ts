import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { AddParkImageUseCase } from '../parks/add-park-image.use-case.js'

export function makeAddParkImageUseCase() {
  const parksRepository = new PrismaParksRepository()
  const addParkImageUseCase = new AddParkImageUseCase(parksRepository)
  return addParkImageUseCase
}
