import type { ParkRepository } from '@repositories/parks-repository.js'
import type { Park } from '@/@types/prisma/client.js'

type ListParksUseCaseResponse = {
  parks: Park[]
}

export class ListParksUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute(): Promise<ListParksUseCaseResponse> {
    const parks = await this.parksRepository.list()

    return { parks }
  }
}
