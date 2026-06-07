import { prisma } from '@lib/prisma/index.js'
import type { ReviewReportsRepository } from '@repositories/review-reports-repository.js'

export class PrismaReviewReportsRepository implements ReviewReportsRepository {
  async create(reviewId: string, userId: string) {
    return await prisma.reviewReport.create({
      data: {
        review: { connect: { id: reviewId } },
        user: { connect: { id: userId } },
      },
    })
  }

  async findByReviewAndUser(reviewId: string, userId: string) {
    return await prisma.reviewReport.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    })
  }

  async countByReview(reviewId: string) {
    return await prisma.reviewReport.count({ where: { reviewId } })
  }
}
