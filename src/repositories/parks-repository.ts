import type { Image, Park, Prisma, Trail } from '@/@types/prisma/client.js'
import type { ParkCategory, ParkSource } from '@/@types/prisma/enums.js'

export type ParkWithRelations = Prisma.ParkGetPayload<{
  include: {
    trails: true
    images: true
    reviews: { include: { user: { select: { id: true; name: true } } } }
  }
}>

export type ParkWithImages = Prisma.ParkGetPayload<{
  include: { images: true }
}> & {
  reviewsCount: number
  averageRating: number | null
  isFavorited: boolean
  isVisited: boolean
}

export type ParkWithDistance = ParkWithImages & { distanceKm: number }

export type ParkFilters = {
  name?: string
  favorited?: boolean
  visited?: boolean
  category?: ParkCategory
  source?: ParkSource
}

export interface ParkRepository {
  create(data: Prisma.ParkCreateInput): Promise<Park>
  findBy(where: Prisma.ParkWhereUniqueInput): Promise<Park | null>
  findByWithRelations(where: Prisma.ParkWhereUniqueInput): Promise<ParkWithRelations | null>
  findNearby(
    lat: number,
    lon: number,
    radiusKm: number,
    limit: number,
    userId: string,
    filters?: ParkFilters,
  ): Promise<ParkWithDistance[]>
  list(
    page: number,
    limit: number,
    userId: string,
    filters?: ParkFilters,
  ): Promise<{ parks: ParkWithImages[]; total: number }>
  update(id: string, data: Prisma.ParkUpdateInput): Promise<Park>
  delete(id: string): Promise<Park>

  addImage(parkId: string, imageData: Prisma.ImageCreateInput): Promise<Image>
  addTrail(parkId: string, trailData: Prisma.TrailCreateInput): Promise<Trail>

  listImages(parkId: string): Promise<Image[]>
  listTrails(parkId: string): Promise<Trail[]>

  deleteImage(imageId: string): Promise<Image>
  deleteTrail(trailId: string): Promise<Trail>
}
