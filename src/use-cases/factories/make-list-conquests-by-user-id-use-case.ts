import { PrismaConquestRepository } from '@/repositories/prisma/prisma-conquests-repository.js'
import { ListConquestsByUserIdUseCase } from '@/use-cases/conquests/list-conquests-by-user-id.js'

export function makeListConquestsByUserIdUseCase() {
  const conquestsRepository = new PrismaConquestRepository()
  const listConquestsByUserIdUseCase = new ListConquestsByUserIdUseCase(conquestsRepository)
  return listConquestsByUserIdUseCase
}
