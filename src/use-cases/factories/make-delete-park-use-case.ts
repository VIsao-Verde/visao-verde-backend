import { DeleteParkUseCase } from '@use-cases/parks/delete-park.js'
import { PrismaParksRepository } from '@/repositories/prisma/prisma-parks-repository.js'

export function makeDeleteParkUseCase() {
  const parkRepository = new PrismaParksRepository()
  const deleteParkUseCase = new DeleteParkUseCase(parkRepository)

  return deleteParkUseCase
}
