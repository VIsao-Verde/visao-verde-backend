import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { CreateReviewUseCase } from '@use-cases/reviews/create-review.js'

export function makeCreateReviewUseCase() {
  return new CreateReviewUseCase(new PrismaReviewRepository(), new PrismaParksRepository())
}
