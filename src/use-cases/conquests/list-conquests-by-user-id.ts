import type { ConquestRepository, ConquestsWithAchievedAt } from '@repositories/conquests-repository.js'

interface ListConquestsByUserIdUseCaseRequest {
  userId: string
  page: number
  limit: number
}

type ListConquestsByUserIdUseCaseResponse = {
  conquests: ConquestsWithAchievedAt[]
  total: number
}

export class ListConquestsByUserIdUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({
    userId,
    page,
    limit,
  }: ListConquestsByUserIdUseCaseRequest): Promise<ListConquestsByUserIdUseCaseResponse> {
    const { conquests, total } = await this.conquestsRepository.listByUserId(userId, page, limit)
    return { conquests, total }
  }
}
