import type { ParkRepository } from '@repositories/parks-repository.js'
import { ParkAlreadyExistsError } from '@use-cases/errors/park-already-exists-error.js'
import { type Park, Prisma } from '@/@types/prisma/client.js'

interface AddParkUseCaseRequest {
  name: string
  description: string
  city: string
  latitude: number
  longitude: number
}

type AddParkUseCaseResponse = {
  park: Park
}

export class AddParkUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({
    name,
    description,
    city,
    latitude,
    longitude,
  }: AddParkUseCaseRequest): Promise<AddParkUseCaseResponse> {
    try {
      const park = await this.parksRepository.create({
        name,
        description,
        city,
        latitude,
        longitude,
      })

      return { park }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ParkAlreadyExistsError()
      }
      throw error
    }
  }
}
