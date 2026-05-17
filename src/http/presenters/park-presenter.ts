import type { ParkWithDistance, ParkWithImages, ParkWithRelations } from '@repositories/parks-repository.js'
import type { Park } from '@/@types/prisma/client.js'
import type { Rating } from '@/@types/prisma/enums.js'

const ratingToNumber: Record<Rating, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
}

type HTTPPark = {
  id: string
  name: string
  description: string | null
  city: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

type HTTPImage = {
  id: string
  url: string
  createdAt: Date
}

type HTTPParkWithImages = HTTPPark & { images: HTTPImage[] }

type HTTPParkWithRelations = HTTPPark & {
  trails: {
    id: string
    name: string
    description: string | null
    distanceKm: number
    durationMin: number | null
    difficulty: string
    createdAt: Date
  }[]
  images: HTTPImage[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    user: { id: string; name: string }
  }[]
  averageRating: number | null
}

type HTTPParkWithDistance = HTTPParkWithImages & { distanceKm: number }

export class ParkPresenter {
  static toHTTP(park: Park): HTTPPark
  static toHTTP(parks: Park[]): HTTPPark[]
  static toHTTP(input: Park | Park[]): HTTPPark | HTTPPark[] {
    if (Array.isArray(input)) {
      return input.map((p) => ParkPresenter.toHTTP(p))
    }

    return {
      id: input.id,
      name: input.name,
      description: input.description,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }
  }

  static toHTTPWithImages(parks: ParkWithImages[]): HTTPParkWithImages[] {
    return parks.map((park) => ({
      id: park.id,
      name: park.name,
      description: park.description,
      city: park.city,
      latitude: park.latitude,
      longitude: park.longitude,
      createdAt: park.createdAt,
      updatedAt: park.updatedAt,
      images: park.images.map((img) => ({ id: img.id, url: img.url, createdAt: img.createdAt })),
    }))
  }

  static toHTTPWithRelations(park: ParkWithRelations): HTTPParkWithRelations {
    const avg =
      park.reviews.length > 0
        ? Math.round((park.reviews.reduce((sum, r) => sum + ratingToNumber[r.rating], 0) / park.reviews.length) * 10) /
          10
        : null

    return {
      id: park.id,
      name: park.name,
      description: park.description,
      city: park.city,
      latitude: park.latitude,
      longitude: park.longitude,
      createdAt: park.createdAt,
      updatedAt: park.updatedAt,
      trails: park.trails.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        distanceKm: t.distanceKm,
        durationMin: t.durationMin,
        difficulty: t.difficulty,
        createdAt: t.createdAt,
      })),
      images: park.images.map((img) => ({ id: img.id, url: img.url, createdAt: img.createdAt })),
      reviews: park.reviews.map((r) => ({
        id: r.id,
        rating: ratingToNumber[r.rating],
        comment: r.comment,
        createdAt: r.createdAt,
        user: { id: r.user.id, name: r.user.name },
      })),
      averageRating: avg,
    }
  }

  static toHTTPWithDistance(park: ParkWithDistance): HTTPParkWithDistance
  static toHTTPWithDistance(parks: ParkWithDistance[]): HTTPParkWithDistance[]
  static toHTTPWithDistance(
    input: ParkWithDistance | ParkWithDistance[],
  ): HTTPParkWithDistance | HTTPParkWithDistance[] {
    if (Array.isArray(input)) {
      return input.map((p) => ParkPresenter.toHTTPWithDistance(p))
    }

    return {
      id: input.id,
      name: input.name,
      description: input.description,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      images: input.images.map((img) => ({ id: img.id, url: img.url, createdAt: img.createdAt })),
      distanceKm: input.distanceKm,
    }
  }
}
