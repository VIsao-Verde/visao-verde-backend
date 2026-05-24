import { ParkNotFoundError } from '@use-cases/errors/park-not-found-error.js'
import type { Park } from '@/@types/prisma/client.js'
import type { ParkRepository } from '@/repositories/parks-repository.js'

interface UpdateParkUseCaseRequest {
  id: string
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

  async execute({ id, ...data }: UpdateParkUseCaseRequest): Promise<UpdateParkUseCaseResponse> {
    const parkExists = await this.parksRepository.findBy({ id })

    if (!parkExists) throw new ParkNotFoundError()

    const park = await this.parksRepository.update(id, data)

    return { park }
  }
}
