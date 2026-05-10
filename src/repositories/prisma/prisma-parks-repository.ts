import { prisma } from '@lib/prisma/index.js'
import type { ParkRepository, ParkWithDistance, ParkWithRelations } from '@repositories/parks-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaParksRepository implements ParkRepository {
  async create(data: Prisma.ParkCreateInput) {
    return await prisma.park.create({ data })
  }

  async findBy(where: Prisma.ParkWhereUniqueInput) {
    return await prisma.park.findUnique({ where })
  }

  async findByWithRelations(where: Prisma.ParkWhereUniqueInput): Promise<ParkWithRelations | null> {
    return await prisma.park.findUnique({
      where,
      include: {
        trails: true,
        images: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
  }

  async findNearby(lat: number, lon: number, radiusKm: number): Promise<ParkWithDistance[]> {
    const parks = await prisma.park.findMany()

    const toRad = (deg: number) => (deg * Math.PI) / 180

    return parks
      .map((park) => {
        const dLat = toRad(park.latitude - lat)
        const dLon = toRad(park.longitude - lon)
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat)) * Math.cos(toRad(park.latitude)) * Math.sin(dLon / 2) ** 2
        const distanceKm = Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) * 100) / 100
        return { ...park, distanceKm }
      })
      .filter((park) => park.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }

  async list() {
    return await prisma.park.findMany()
  }

  async update(id: string, data: Prisma.ParkUpdateInput) {
    return await prisma.park.update({ where: { id }, data })
  }

  async delete(id: string) {
    return await prisma.park.delete({ where: { id } })
  }

  async addImage(parkId: string, imageData: Prisma.ImageCreateInput) {
    return prisma.image.create({
      data: {
        ...imageData,
        park: { connect: { id: parkId } },
      },
    })
  }

  async addTrail(parkId: string, trailData: Prisma.TrailCreateInput) {
    return prisma.trail.create({
      data: {
        ...trailData,
        park: { connect: { id: parkId } },
      },
    })
  }

  async listImages(parkId: string) {
    return await prisma.image.findMany({ where: { parkId } })
  }

  async listTrails(parkId: string) {
    return await prisma.trail.findMany({ where: { parkId } })
  }

  async deleteImage(imageId: string) {
    return await prisma.image.delete({ where: { id: imageId } })
  }

  async deleteTrail(trailId: string) {
    return await prisma.trail.delete({ where: { id: trailId } })
  }
}
