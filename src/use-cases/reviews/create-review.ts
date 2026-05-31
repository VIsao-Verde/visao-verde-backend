import type { ParkRepository } from '@repositories/parks-repository.js'
import type { ReviewData, ReviewRepository } from '@repositories/reviews-repository.js'
import type { CheckAndGrantConquestsUseCase } from '@use-cases/conquests/check-and-grant-conquests.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import { logError } from '@lib/logger/helpers.js'
import type { Review } from '@/@types/prisma/client.js'

interface CreateReviewUseCaseRequest {
  userId: string
  parkId: string
  data: ReviewData
}

type CreateReviewUseCaseResponse = {
  review: Review
}

export class CreateReviewUseCase {
  constructor(
    private reviewsRepository: ReviewRepository,
    private parksRepository: ParkRepository,
    private checkAndGrantConquestsUseCase?: CheckAndGrantConquestsUseCase,
  ) {}

  async execute({ userId, parkId, data }: CreateReviewUseCaseRequest): Promise<CreateReviewUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })

    if (!park) throw new ParkNotFoundError()

    const review = await this.reviewsRepository.create(userId, parkId, data)

    await this.checkAndGrantConquestsUseCase
      ?.execute({ userId })
      .catch((error) => logError(error, { userId }, 'Failed to check and grant conquests after review'))

    return { review }
  }
}
