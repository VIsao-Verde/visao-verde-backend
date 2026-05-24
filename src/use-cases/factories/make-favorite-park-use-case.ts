import { PrismaParksRepository } from '@repositories/prisma/prisma-parks-repository.js'
import { PrismaUserFavoriteParksRepository } from '@repositories/prisma/prisma-user-favorite-parks-repository.js'
import { FavoriteParkUseCase } from '@use-cases/favorites/favorite-park.js'

export function makeFavoriteParkUseCase() {
  const userFavoriteParksRepository = new PrismaUserFavoriteParksRepository()
  const parksRepository = new PrismaParksRepository()
  const favoriteParkUseCase = new FavoriteParkUseCase(userFavoriteParksRepository, parksRepository)

  return favoriteParkUseCase
}
