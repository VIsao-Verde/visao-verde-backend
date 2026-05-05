import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import type { ParkRepository } from '@/repositories/parks-repository.js'

interface DeleteParkUseCaseRequest {
  publicId: string
}

export class DeleteParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ publicId }: DeleteParkUseCaseRequest): Promise<void> {
    const parkExists = await this.parksRepository.findBy({ publicId })

    if (!parkExists) throw new ResourceNotFoundError()

    await this.parksRepository.delete(parkExists.id)
  }
}
