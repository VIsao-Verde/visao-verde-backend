import { prisma } from '@lib/prisma/index.js'
import type {
  ReviewData,
  ReviewRepository,
  ReviewWithPark,
  ReviewWithUser,
} from '@repositories/reviews-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaReviewRepository implements ReviewRepository {
  async create(userId: string, parkId: string, reviewData: ReviewData) {
    return await prisma.review.create({
      data: {
        ...reviewData,
        park: { connect: { id: parkId } },
        user: { connect: { id: userId } },
      },
    })
  }

  async findBy(where: Prisma.ReviewWhereUniqueInput) {
    return await prisma.review.findUnique({ where })
  }

  async listByPark(
    parkId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: ReviewWithUser[]; total: number }> {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { parkId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { parkId } }),
    ])

    return { reviews, total }
  }

  async listByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ reviews: ReviewWithPark[]; total: number }> {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: { park: { select: { id: true, name: true, city: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ])

    return { reviews, total }
  }

  async delete(id: string) {
    return await prisma.review.delete({ where: { id } })
  }
}
