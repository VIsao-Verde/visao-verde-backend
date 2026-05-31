import { prisma } from '@lib/prisma/index.js'
import { getReviewStats } from '@repositories/prisma/helpers/review-stats.js'
import type {
  FavoriteParkWithDetails,
  UserFavoriteParksRepository,
} from '@repositories/user-favorite-parks-repository.js'
import { ParkAlreadyFavoritedError } from '@use-cases/errors/park-already-favorited-error.js'
import { ParkNotFavoritedError } from '@use-cases/errors/park-not-favorited-error.js'
import { Prisma } from '@/@types/prisma/client.js'

export class PrismaUserFavoriteParksRepository implements UserFavoriteParksRepository {
  async favorite(userId: string, parkId: string) {
    try {
      return await prisma.userFavoritePark.create({ data: { userId, parkId } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ParkAlreadyFavoritedError()
      }
      throw error
    }
  }

  async unfavorite(userId: string, parkId: string) {
    try {
      await prisma.userFavoritePark.delete({ where: { userId_parkId: { userId, parkId } } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ParkNotFavoritedError()
      }
      throw error
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return await prisma.userFavoritePark.count({ where: { userId } })
  }

  async list(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [rows, total] = await Promise.all([
      prisma.userFavoritePark.findMany({
        where: { userId },
        include: { park: { include: { images: true } } },
        orderBy: { favoritedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userFavoritePark.count({ where: { userId } }),
    ])

    const parkIds = rows.map((r) => r.parkId)
    const [stats, visits] = await Promise.all([
      getReviewStats(parkIds),
      prisma.userVisitedPark.findMany({
        where: { userId, parkId: { in: parkIds } },
        select: { parkId: true, visitedAt: true },
      }),
    ])

    const visitsByPark = new Map(visits.map((v) => [v.parkId, v.visitedAt]))

    const favorites: FavoriteParkWithDetails[] = rows.map((row) => {
      const stat = stats.get(row.parkId)
      const lastVisitedAt = visitsByPark.get(row.parkId) ?? null
      return {
        ...row.park,
        reviewsCount: stat?.count ?? 0,
        averageRating: stat?.avg ?? null,
        isFavorited: true,
        isVisited: lastVisitedAt !== null,
        favoritedAt: row.favoritedAt,
        lastVisitedAt,
      }
    })

    return { favorites, total }
  }
}
