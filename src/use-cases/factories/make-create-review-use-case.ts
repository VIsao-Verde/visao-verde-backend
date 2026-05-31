import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { CreateReviewUseCase } from '@use-cases/reviews/create-review.js'
import { makeCheckAndGrantConquestsUseCase } from '@use-cases/factories/make-check-and-grant-conquests-use-case.js'

export function makeCreateReviewUseCase() {
  const reviewsRepository = new PrismaReviewRepository()
  const parksRepository = new PrismaParksRepository()
  const checkAndGrantConquestsUseCase = makeCheckAndGrantConquestsUseCase()
  const createReviewUseCase = new CreateReviewUseCase(reviewsRepository, parksRepository, checkAndGrantConquestsUseCase)
  return createReviewUseCase
}
