import type { ParkRepository } from '@repositories/parks-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import type { Park } from '@/@types/prisma/client.js'

interface FindParkUseCaseRequest {
  publicId: string
}

type FindParkUseCaseResponse = {
  park: Park
}

export class FindParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ publicId }: FindParkUseCaseRequest): Promise<FindParkUseCaseResponse> {
    const park = await this.parksRepository.findBy({
      publicId,
    })

    if (!park) throw new ParkNotFoundError()

    return { park }
  }
}
