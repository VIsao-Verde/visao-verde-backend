import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { ListReviewsByUserUseCase } from '@use-cases/reviews/list-reviews-by-user.js'

export function makeListReviewsByUserUseCase() {
  return new ListReviewsByUserUseCase(new PrismaReviewRepository())
}
