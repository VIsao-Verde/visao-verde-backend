import { PrismaUserFavoriteParksRepository } from '@repositories/prisma/prisma-user-favorite-parks-repository.js'
import { ListFavoritesUseCase } from '@use-cases/favorites/list-favorites.js'

export function makeListFavoritesUseCase() {
  const userFavoriteParksRepository = new PrismaUserFavoriteParksRepository()
  return new ListFavoritesUseCase(userFavoriteParksRepository)
}
