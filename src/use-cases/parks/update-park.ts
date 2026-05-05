import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import type { Park } from '@/@types/prisma/client.js'
import type { ParkRepository } from '@/repositories/parks-repository.js'

interface UpdateParkUseCaseRequest {
  publicId: string
  name?: string
  description?: string
  city?: string
  latitude?: number
  longitude?: number
}

type UpdateParkUseCaseResponse = {
  park: Park
}

export class UpdateParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({ publicId, ...data }: UpdateParkUseCaseRequest): Promise<UpdateParkUseCaseResponse> {
    const parkToUpdate = await this.parksRepository.findBy({ publicId })

    if (!parkToUpdate) throw new ResourceNotFoundError()

    const park = await this.parksRepository.update(parkToUpdate.id, {
      ...data,
    })

    return { park }
  }
}
