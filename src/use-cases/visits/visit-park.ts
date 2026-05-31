import type { ParkRepository } from '@repositories/parks-repository.js'
import type { UserVisitedParksRepository } from '@repositories/user-visited-parks-repository.js'
import type { CheckAndGrantConquestsUseCase } from '@use-cases/conquests/check-and-grant-conquests.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import { logError } from '@lib/logger/helpers.js'
import type { UserVisitedPark } from '@/@types/prisma/client.js'

interface VisitParkUseCaseRequest {
  userId: string
  parkId: string
}

type VisitParkUseCaseResponse = {
  visit: UserVisitedPark
}

export class VisitParkUseCase {
  constructor(
    private userVisitedParksRepository: UserVisitedParksRepository,
    private parksRepository: ParkRepository,
    private checkAndGrantConquestsUseCase?: CheckAndGrantConquestsUseCase,
  ) {}

  async execute({ userId, parkId }: VisitParkUseCaseRequest): Promise<VisitParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const visit = await this.userVisitedParksRepository.visit(userId, parkId)

    await this.checkAndGrantConquestsUseCase
      ?.execute({ userId })
      .catch((error) => logError(error, { userId }, 'Failed to check and grant conquests after visit'))

    return { visit }
  }
}
