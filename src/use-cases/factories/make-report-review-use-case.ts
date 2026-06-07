import { PrismaReviewReportsRepository } from '@repositories/prisma/prisma-review-reports-repository.js'
import { PrismaReviewRepository } from '@repositories/prisma/prisma-review-repository.js'
import { ReportReviewUseCase } from '@use-cases/reviews/report-review.js'

export function makeReportReviewUseCase() {
  const reviewsRepo = new PrismaReviewRepository()
  const reportsRepo = new PrismaReviewReportsRepository()
  return new ReportReviewUseCase(reviewsRepo, reportsRepo)
}
