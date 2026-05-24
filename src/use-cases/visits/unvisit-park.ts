import type { UserVisitedParksRepository } from '@repositories/user-visited-parks-repository.js'

interface UnvisitParkUseCaseRequest {
  userId: string
  parkId: string
}

export class UnvisitParkUseCase {
  constructor(private userVisitedParksRepository: UserVisitedParksRepository) {}

  async execute({ userId, parkId }: UnvisitParkUseCaseRequest): Promise<void> {
    await this.userVisitedParksRepository.unvisit(userId, parkId)
  }
}
