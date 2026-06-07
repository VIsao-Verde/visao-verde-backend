import { logger } from '@lib/logger/index.js'
import { makeReportReviewUseCase } from '@use-cases/factories/make-report-review-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'

export async function reportReview(request: FastifyRequest, reply: FastifyReply) {
  const { id: reviewId } = idSchema.parse(request.params)

  const useCase = makeReportReviewUseCase()

  const { reviewDeleted } = await useCase.execute({
    reviewId,
    reporterUserId: request.user.sub,
  })

  logger.info({ targetId: reviewId, reviewDeleted }, 'Review reported successfully!')

  return reply.status(201).send({ reviewDeleted })
}
