import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { DeleteReviewUseCase } from '@use-cases/reviews/delete-review.js'

export function makeDeleteReviewUseCase() {
  return new DeleteReviewUseCase(new PrismaReviewRepository())
}
