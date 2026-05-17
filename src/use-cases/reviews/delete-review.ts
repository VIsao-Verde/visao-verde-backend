import type { ReviewRepository } from '@repositories/reviews-repository.js'
import { NotReviewOwnerError } from '@use-cases/errors/not-review-owner-error.js'
import { ReviewNotFoundError } from '@use-cases/errors/review-not-found-error.js'
import { UserRole } from '@/@types/prisma/enums.js'

interface DeleteReviewUseCaseRequest {
  id: string
  userId: string
  userRole: UserRole
}

export class DeleteReviewUseCase {
  constructor(private reviewsRepository: ReviewRepository) {}

  async execute({ id, userId, userRole }: DeleteReviewUseCaseRequest): Promise<void> {
    const review = await this.reviewsRepository.findBy({ id })

    if (!review) throw new ReviewNotFoundError()

    if (userRole !== UserRole.ADMIN && review.userId !== userId) {
      throw new NotReviewOwnerError()
    }

    await this.reviewsRepository.delete(id)
  }
}
