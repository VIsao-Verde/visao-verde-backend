import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import type { ParkRepository } from '@/repositories/parks-repository.js'

interface DeleteParkUseCaseRequest {
  id: string
}

export class DeleteParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ id }: DeleteParkUseCaseRequest): Promise<void> {
    const parkExists = await this.parksRepository.findBy({ id })

    if (!parkExists) throw new ResourceNotFoundError()

    await this.parksRepository.delete(id)
  }
}
