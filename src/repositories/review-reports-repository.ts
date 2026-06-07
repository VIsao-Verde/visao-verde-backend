import type { ReviewReport } from '@/@types/prisma/client.js'

export interface ReviewReportsRepository {
  create(reviewId: string, userId: string): Promise<ReviewReport>
  findByReviewAndUser(reviewId: string, userId: string): Promise<ReviewReport | null>
  countByReview(reviewId: string): Promise<number>
}
