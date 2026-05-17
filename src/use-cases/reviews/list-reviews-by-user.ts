import type { ReviewRepository, ReviewWithPark } from '@repositories/reviews-repository.js'

interface ListReviewsByUserUseCaseRequest {
  userId: string
  page: number
  limit: number
}

type ListReviewsByUserUseCaseResponse = {
  reviews: ReviewWithPark[]
  total: number
}

export class ListReviewsByUserUseCase {
  constructor(private reviewsRepository: ReviewRepository) {}

  async execute({
    userId,
    page,
    limit,
  }: ListReviewsByUserUseCaseRequest): Promise<ListReviewsByUserUseCaseResponse> {
    return await this.reviewsRepository.listByUser(userId, page, limit)
  }
}
