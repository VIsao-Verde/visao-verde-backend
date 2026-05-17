import type { Image, Park, Prisma, Trail } from '@/@types/prisma/client.js'

export type ParkWithRelations = Prisma.ParkGetPayload<{
  include: {
    trails: true
    images: true
    reviews: { include: { user: { select: { id: true; name: true } } } }
  }
}>

export type ParkWithImages = Prisma.ParkGetPayload<{
  include: { images: true }
}>

export type ParkWithDistance = ParkWithImages & { distanceKm: number }

export interface ParkRepository {
  create(data: Prisma.ParkCreateInput): Promise<Park>
  findBy(where: Prisma.ParkWhereUniqueInput): Promise<Park | null>
  findByWithRelations(where: Prisma.ParkWhereUniqueInput): Promise<ParkWithRelations | null>
  findNearby(lat: number, lon: number, radiusKm: number, limit: number): Promise<ParkWithDistance[]>
  list(page: number, limit: number): Promise<{ parks: ParkWithImages[]; total: number }>
  update(id: string, data: Prisma.ParkUpdateInput): Promise<Park>
  delete(id: string): Promise<Park>

  addImage(parkId: string, imageData: Prisma.ImageCreateInput): Promise<Image>
  addTrail(parkId: string, trailData: Prisma.TrailCreateInput): Promise<Trail>

  listImages(parkId: string): Promise<Image[]>
  listTrails(parkId: string): Promise<Trail[]>

  deleteImage(imageId: string): Promise<Image>
  deleteTrail(trailId: string): Promise<Trail>
}
