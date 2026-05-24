import type { ParkFilters, ParkRepository, ParkWithImages } from '@repositories/parks-repository.js'

interface ListParksUseCaseRequest {
  page: number
  limit: number
  userId: string
  filters?: ParkFilters
}

type ListParksUseCaseResponse = {
  parks: ParkWithImages[]
  total: number
}

export class ListParksUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ page, limit, userId, filters }: ListParksUseCaseRequest): Promise<ListParksUseCaseResponse> {
    const { parks, total } = await this.parksRepository.list(page, limit, userId, filters)

    return { parks, total }
  }
}
