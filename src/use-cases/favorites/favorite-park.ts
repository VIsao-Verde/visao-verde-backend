import type { ParkRepository } from '@repositories/parks-repository.js'
import type { UserFavoriteParksRepository } from '@repositories/user-favorite-parks-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import type { UserFavoritePark } from '@/@types/prisma/client.js'

interface FavoriteParkUseCaseRequest {
  userId: string
  parkId: string
}

type FavoriteParkUseCaseResponse = {
  favorite: UserFavoritePark
}

export class FavoriteParkUseCase {
  constructor(
    private userFavoriteParksRepository: UserFavoriteParksRepository,
    private parksRepository: ParkRepository,
  ) {}

  async execute({ userId, parkId }: FavoriteParkUseCaseRequest): Promise<FavoriteParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const favorite = await this.userFavoriteParksRepository.favorite(userId, parkId)

    return { favorite }
  }
}
