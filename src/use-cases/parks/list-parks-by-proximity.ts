import type { ParkFilters, ParkRepository, ParkWithDistance } from '@repositories/parks-repository.js'

interface ListParksByProximityUseCaseRequest {
  latitude: number
  longitude: number
  radiusKm: number
  limit: number
  userId: string
  filters?: ParkFilters
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
    limit,
    userId,
    filters,
  }: ListParksByProximityUseCaseRequest): Promise<ListParksByProximityUseCaseResponse> {
    const parks = await this.parksRepository.findNearby(latitude, longitude, radiusKm, limit, userId, filters)

    return { parks }
  }
}
