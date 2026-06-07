import { supabase } from '@lib/supabase/index.js'
import type { ReviewReportsRepository } from '@repositories/review-reports-repository.js'
import type { ReviewRepository } from '@repositories/reviews-repository.js'
import { AlreadyReportedReviewError } from '@use-cases/errors/already-reported-review-error.js'
import { CannotReportOwnReviewError } from '@use-cases/errors/cannot-report-own-review-error.js'
import { ReviewNotFoundError } from '@use-cases/errors/review-not-found-error.js'

const REVIEW_REPORT_THRESHOLD = 5

interface ReportReviewUseCaseRequest {
  reviewId: string
  reporterUserId: string
}

type ReportReviewUseCaseResponse = {
  reviewDeleted: boolean
}

export class ReportReviewUseCase {
  constructor(
    private reviewsRepository: ReviewRepository,
    private reviewReportsRepository: ReviewReportsRepository,
  ) {}

  async execute({ reviewId, reporterUserId }: ReportReviewUseCaseRequest): Promise<ReportReviewUseCaseResponse> {
    const review = await this.reviewsRepository.findBy({ id: reviewId })

    if (!review) throw new ReviewNotFoundError()

    if (review.userId === reporterUserId) throw new CannotReportOwnReviewError()

    const existing = await this.reviewReportsRepository.findByReviewAndUser(reviewId, reporterUserId)

    if (existing) throw new AlreadyReportedReviewError()

    await this.reviewReportsRepository.create(reviewId, reporterUserId)

    const reportCount = await this.reviewReportsRepository.countByReview(reviewId)

    if (reportCount >= REVIEW_REPORT_THRESHOLD) {
      if (review.imageUrl) {
        const storagePath = review.imageUrl.split('/public/park-images/')[1]
        await supabase.storage.from('park-images').remove([storagePath])
      }

      await this.reviewsRepository.delete(reviewId)

      return { reviewDeleted: true }
    }

    return { reviewDeleted: false }
  }
}
