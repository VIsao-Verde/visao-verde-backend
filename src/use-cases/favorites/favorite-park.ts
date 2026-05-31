import type { ParkRepository } from '@repositories/parks-repository.js'
import type { UserFavoriteParksRepository } from '@repositories/user-favorite-parks-repository.js'
import type { CheckAndGrantConquestsUseCase } from '@use-cases/conquests/check-and-grant-conquests.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import { logError } from '@lib/logger/helpers.js'
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
    private checkAndGrantConquestsUseCase?: CheckAndGrantConquestsUseCase,
  ) {}

  async execute({ userId, parkId }: FavoriteParkUseCaseRequest): Promise<FavoriteParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const favorite = await this.userFavoriteParksRepository.favorite(userId, parkId)

    await this.checkAndGrantConquestsUseCase
      ?.execute({ userId })
      .catch((error) => logError(error, { userId }, 'Failed to check and grant conquests after favorite'))

    return { favorite }
  }
}
