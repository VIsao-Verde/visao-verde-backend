import type { Image, Park, Prisma, Trail } from '@/@types/prisma/client.js'

export interface ParkRepository {
  create(data: Prisma.ParkCreateInput): Promise<Park>
  findBy(where: Prisma.ParkWhereUniqueInput): Promise<Park | null>
  list(): Promise<Park[]>
  update(id: number, data: Prisma.ParkUpdateInput): Promise<Park>
  delete(id: number): Promise<Park>

  addImage(parkId: number, imageData: Prisma.ImageCreateInput): Promise<Image>
  addTrail(parkId: number, trailData: Prisma.TrailCreateInput): Promise<Trail>

  listImages(parkId: number): Promise<Image[]>
  listTrails(parkId: number): Promise<Trail[]>

  deleteImage(imageId: number): Promise<Image>
  deleteTrail(trailId: number): Promise<Trail>
}
