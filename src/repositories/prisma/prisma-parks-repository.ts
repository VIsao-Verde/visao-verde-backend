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
    const radiusMeters = radiusKm * 1000

    const rows = await prisma.$queryRaw<
      Array<{
        id: string
        name: string
        description: string | null
        city: string
        latitude: number
        longitude: number
        created_at: Date
        updated_at: Date
        distance_m: number
      }>
    >`
      SELECT
        id,
        name,
        description,
        city,
        latitude,
        longitude,
        created_at,
        updated_at,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
        ) AS distance_m
      FROM parks
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance_m ASC
    `

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      distanceKm: Math.round((row.distance_m / 1000) * 100) / 100,
    }))
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
