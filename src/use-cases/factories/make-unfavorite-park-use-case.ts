import { PrismaUserFavoriteParksRepository } from '@repositories/prisma/prisma-user-favorite-parks-repository.js'
import { UnfavoriteParkUseCase } from '@use-cases/favorites/unfavorite-park.js'

export function makeUnfavoriteParkUseCase() {
  const userFavoriteParksRepository = new PrismaUserFavoriteParksRepository()
  const unfavoriteParkUseCase = new UnfavoriteParkUseCase(userFavoriteParksRepository)

  return unfavoriteParkUseCase
}
