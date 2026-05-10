import { prisma } from '@lib/prisma/index.js'
import type { ReviewData, ReviewRepository } from '@repositories/reviews-repository.js'
import type { Prisma, Review } from '@/@types/prisma/client.js'

export class PrismaReviewRepository implements ReviewRepository {
  async create(userId: string, parkId: string, reviewData: ReviewData) {
    return await prisma.review.create({
      data: {
        ...reviewData,
        park: {
          connect: { id: parkId },
        },
        user: {
          connect: { id: userId },
        },
      },
    })
  }

  async findBy(where: Prisma.ReviewWhereUniqueInput) {
    return await prisma.review.findUnique({
      where,
    })
  }

  async listByPark(parkId: string): Promise<Review[]> {
    return await prisma.review.findMany({ where: { parkId } })
  }

  async listByUser(userId: string): Promise<Review[]> {
    return await prisma.review.findMany({ where: { userId } })
  }

  async delete(id: string) {
    return await prisma.review.delete({
      where: { id },
    })
  }
}
