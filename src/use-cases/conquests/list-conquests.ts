import type { ConquestRepository } from '@repositories/conquests-repository.js'
import type { Conquest } from '@/@types/prisma/client.js'

interface ListConquestsUseCaseRequest {
  page: number
  limit: number
}

type ListConquestsUseCaseResponse = {
  conquests: Conquest[]
  total: number
}

export class ListConquestsUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({ page, limit }: ListConquestsUseCaseRequest): Promise<ListConquestsUseCaseResponse> {
    const { conquests, total } = await this.conquestsRepository.list(page, limit)
    return { conquests, total }
  }
}
