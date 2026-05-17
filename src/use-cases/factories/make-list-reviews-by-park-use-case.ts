import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { ListReviewsByParkUseCase } from '@use-cases/reviews/list-reviews-by-park.js'

export function makeListReviewsByParkUseCase() {
  return new ListReviewsByParkUseCase(new PrismaReviewRepository(), new PrismaParksRepository())
}
