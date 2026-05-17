import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ReviewPresenter } from '@/http/presenters/review-presenter.js'
import { createReviewSchema, ratingNumberToEnum } from '@/http/schemas/reviews/create-review-schema.js'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeCreateReviewUseCase } from '@/use-cases/factories/make-create-review-use-case.js'

export async function createReview(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)
  const { rating, comment } = createReviewSchema.parse(request.body)

  const useCase = makeCreateReviewUseCase()

  const { review } = await useCase.execute({
    userId: request.user.sub,
    parkId,
    data: {
      rating: ratingNumberToEnum[rating as keyof typeof ratingNumberToEnum],
      comment,
    },
  })

  logger.info({ targetId: review.id, parkId }, 'Review created successfully!')

  return reply.status(201).send({ review: ReviewPresenter.toHTTP(review) })
}
