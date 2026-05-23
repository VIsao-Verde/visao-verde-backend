import type { ParkRepository } from '@/repositories/parks-repository.js'
import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'

interface DeleteParkUseCaseRequest {
  id: string
}

export class DeleteParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ id }: DeleteParkUseCaseRequest): Promise<void> {
    const parkExists = await this.parksRepository.findBy({ id })

    if (!parkExists) throw new ParkNotFoundError()

    await this.parksRepository.delete(id)
  }
}
