import type { ParkRepository } from '@repositories/parks-repository.js'
import type { ReviewRepository, ReviewWithUser } from '@repositories/reviews-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'

interface ListReviewsByParkUseCaseRequest {
  parkId: string
  page: number
  limit: number
}

type ListReviewsByParkUseCaseResponse = {
  reviews: ReviewWithUser[]
  total: number
}

export class ListReviewsByParkUseCase {
  constructor(
    private reviewsRepository: ReviewRepository,
    private parksRepository: ParkRepository,
  ) {}

  async execute({ parkId, page, limit }: ListReviewsByParkUseCaseRequest): Promise<ListReviewsByParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })

    if (!park) throw new ParkNotFoundError()

    return await this.reviewsRepository.listByPark(parkId, page, limit)
  }
}
