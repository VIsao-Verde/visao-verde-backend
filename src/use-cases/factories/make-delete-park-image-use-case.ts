import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { DeleteParkImageUseCase } from '../parks/delete-park-image.use-case.js'

export function makeDeleteParkImageUseCase() {
  const parksRepository = new PrismaParksRepository()
  const deleteParkImageUseCase = new DeleteParkImageUseCase(parksRepository)
  return deleteParkImageUseCase
}
