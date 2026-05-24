import { PrismaConquestRepository } from '@/repositories/prisma/prisma-conquests-repository.js'
import { ListConquestsUseCase } from '@/use-cases/conquests/list-conquests.js'

export function makeListConquestsUseCase() {
  const conquestsRepository = new PrismaConquestRepository()
  const listConquestsUseCase = new ListConquestsUseCase(conquestsRepository)
  return listConquestsUseCase
}
