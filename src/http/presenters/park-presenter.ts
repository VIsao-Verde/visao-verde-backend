import type { Park } from '@prisma/client'

type HTTPPark = {
  id: string
  name: string
  description: string
  city: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

export class ParkPresenter {
  static toHTTP(park: Park): HTTPPark
  static toHTTP(parks: Park[]): HTTPPark[]
  static toHTTP(input: Park | Park[]): HTTPPark | HTTPPark[] {
    if (Array.isArray(input)) {
      return input.map((p) => ParkPresenter.toHTTP(p))
    }

    return {
      id: input.publicId,
      name: input.name,
      description: input.description,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }
  }
}
