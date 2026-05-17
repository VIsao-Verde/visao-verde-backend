import type { ParkRepository, ParkWithImages } from '@repositories/parks-repository.js'

interface ListParksUseCaseRequest {
  page: number
  limit: number
}

type ListParksUseCaseResponse = {
  parks: ParkWithImages[]
  total: number
}

export class ListParksUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ page, limit }: ListParksUseCaseRequest): Promise<ListParksUseCaseResponse> {
    const { parks, total } = await this.parksRepository.list(page, limit)

    return { parks, total }
  }
}
