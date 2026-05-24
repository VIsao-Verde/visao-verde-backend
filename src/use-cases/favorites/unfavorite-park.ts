import type { UserFavoriteParksRepository } from '@repositories/user-favorite-parks-repository.js'

interface UnfavoriteParkUseCaseRequest {
  userId: string
  parkId: string
}

export class UnfavoriteParkUseCase {
  constructor(private userFavoriteParksRepository: UserFavoriteParksRepository) {}

  async execute({ userId, parkId }: UnfavoriteParkUseCaseRequest): Promise<void> {
    await this.userFavoriteParksRepository.unfavorite(userId, parkId)
  }
}
