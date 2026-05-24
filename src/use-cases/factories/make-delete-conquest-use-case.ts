import { DeleteConquestUseCase } from '@use-cases/conquests/delete-conquest.js'
import { PrismaConquestRepository } from '@/repositories/prisma/prisma-conquests-repository.js'

export function makeDeleteConquestUseCase() {
  const conquestsRepository = new PrismaConquestRepository()
  const deleteConquestUseCase = new DeleteConquestUseCase(conquestsRepository)
  return deleteConquestUseCase
}
