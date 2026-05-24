import type { ParkRepository } from '@repositories/parks-repository.js'
import type { UserVisitedParksRepository } from '@repositories/user-visited-parks-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
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
  ) {}

  async execute({ userId, parkId }: VisitParkUseCaseRequest): Promise<VisitParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({ id: parkId })
    if (!park) throw new ParkNotFoundError()

    const visit = await this.userVisitedParksRepository.visit(userId, parkId)

    return { visit }
  }
}
