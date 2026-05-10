import type { ParkRepository, ParkWithDistance } from '@repositories/parks-repository.js'

interface ListParksByProximityUseCaseRequest {
  latitude: number
  longitude: number
  radiusKm: number
}

type ListParksByProximityUseCaseResponse = {
  parks: ParkWithDistance[]
}

export class ListParksByProximityUseCase {
  constructor(private parksRepository: ParkRepository) {}

  async execute({
    latitude,
    longitude,
    radiusKm,
  }: ListParksByProximityUseCaseRequest): Promise<ListParksByProximityUseCaseResponse> {
    const parks = await this.parksRepository.findNearby(latitude, longitude, radiusKm)

    return { parks }
  }
}
