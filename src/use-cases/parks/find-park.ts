import type { ParkRepository, ParkWithRelations } from '@repositories/parks-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'

interface FindParkUseCaseRequest {
  id: string
}

type FindParkUseCaseResponse = {
  park: ParkWithRelations
}

export class FindParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ id }: FindParkUseCaseRequest): Promise<FindParkUseCaseResponse> {
    const park = await this.parksRepository.findByWithRelations({ id })

    if (!park) throw new ParkNotFoundError()

    return { park }
  }
}
