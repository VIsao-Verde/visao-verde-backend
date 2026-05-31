import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaUserFavoriteParksRepository } from '@repositories/prisma/prisma-user-favorite-parks-repository.js'
import { FavoriteParkUseCase } from '@use-cases/favorites/favorite-park.js'
import { makeCheckAndGrantConquestsUseCase } from '@use-cases/factories/make-check-and-grant-conquests-use-case.js'

export function makeFavoriteParkUseCase() {
  const userFavoriteParksRepository = new PrismaUserFavoriteParksRepository()
  const parksRepository = new PrismaParksRepository()
  const checkAndGrantConquestsUseCase = makeCheckAndGrantConquestsUseCase()
  const favoriteParkUseCase = new FavoriteParkUseCase(userFavoriteParksRepository, parksRepository, checkAndGrantConquestsUseCase)

  return favoriteParkUseCase
}
