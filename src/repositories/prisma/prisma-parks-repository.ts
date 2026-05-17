import { prisma } from '@lib/prisma/index.js'
import type { ParkRepository, ParkWithDistance, ParkWithRelations } from '@repositories/parks-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaParksRepository implements ParkRepository {
  private async getReviewStats(parkIds: string[]): Promise<Map<string, { count: number; avg: number | null }>> {
    if (parkIds.length === 0) return new Map()

    const rows = await prisma.$queryRaw<Array<{ park_id: string; count: bigint; avg: number | null }>>`
      SELECT
        park_id,
        COUNT(*) AS count,
        AVG(CASE rating
          WHEN 'one' THEN 1
          WHEN 'two' THEN 2
          WHEN 'three' THEN 3
          WHEN 'four' THEN 4
          WHEN 'five' THEN 5
        END) AS avg
      FROM reviews
      WHERE park_id = ANY(${parkIds}::text[])
      GROUP BY park_id
    `

    return new Map(
      rows.map((r) => [
        r.park_id,
        {
          count: Number(r.count),
          avg: r.avg !== null ? Math.round(Number(r.avg) * 10) / 10 : null,
        },
      ]),
    )
  }

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

  async findNearby(lat: number, lon: number, radiusKm: number, limit: number): Promise<ParkWithDistance[]> {
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
      LIMIT ${limit}
    `

    if (rows.length === 0) return []

    const parkIds = rows.map((r) => r.id)
    const [images, stats] = await Promise.all([
      prisma.image.findMany({ where: { parkId: { in: parkIds } } }),
      this.getReviewStats(parkIds),
    ])
    const imagesByPark = new Map<string, typeof images>()
    for (const img of images) {
      const list = imagesByPark.get(img.parkId) ?? []
      list.push(img)
      imagesByPark.set(img.parkId, list)
    }

    return rows.map((row) => {
      const stat = stats.get(row.id)
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        images: imagesByPark.get(row.id) ?? [],
        distanceKm: Math.round((row.distance_m / 1000) * 100) / 100,
        reviewsCount: stat?.count ?? 0,
        averageRating: stat?.avg ?? null,
      }
    })
  }

  async list(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [parks, total] = await Promise.all([
      prisma.park.findMany({
        include: { images: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.park.count(),
    ])

    const stats = await this.getReviewStats(parks.map((p) => p.id))

    const parksWithStats = parks.map((p) => {
      const stat = stats.get(p.id)
      return {
        ...p,
        reviewsCount: stat?.count ?? 0,
        averageRating: stat?.avg ?? null,
      }
    })

    return { parks: parksWithStats, total }
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
