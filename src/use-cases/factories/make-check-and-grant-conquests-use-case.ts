import { PrismaConquestRepository } from '@repositories/prisma/prisma-conquests-repository.js'
import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { PrismaUserFavoriteParksRepository } from '@repositories/prisma/prisma-user-favorite-parks-repository.js'
import { PrismaUserVisitedParksRepository } from '@repositories/prisma/prisma-user-visited-parks-repository.js'
import { CheckAndGrantConquestsUseCase } from '@use-cases/conquests/check-and-grant-conquests.js'

export function makeCheckAndGrantConquestsUseCase() {
  const conquestsRepository = new PrismaConquestRepository()
  const userVisitedParksRepository = new PrismaUserVisitedParksRepository()
  const userFavoriteParksRepository = new PrismaUserFavoriteParksRepository()
  const reviewsRepository = new PrismaReviewRepository()
  const checkAndGrantConquestsUseCase = new CheckAndGrantConquestsUseCase(
    conquestsRepository,
    userVisitedParksRepository,
    userFavoriteParksRepository,
    reviewsRepository,
  )
  return checkAndGrantConquestsUseCase
}
