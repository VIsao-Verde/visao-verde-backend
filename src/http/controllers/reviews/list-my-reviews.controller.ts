import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ReviewPresenter } from '@/http/presenters/review-presenter.js'
import { listReviewsSchema } from '@/http/schemas/reviews/list-reviews-schema.js'
import { makeListReviewsByUserUseCase } from '@/use-cases/factories/make-list-reviews-by-user-use-case.js'

export async function listMyReviews(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = listReviewsSchema.parse(request.query)

  const useCase = makeListReviewsByUserUseCase()

  const { reviews, total } = await useCase.execute({
    userId: request.user.sub,
    page,
    limit,
  })

  logger.info({ page, limit }, 'Own reviews listed successfully!')

  return reply.status(200).send({
    reviews: ReviewPresenter.toHTTPWithPark(reviews),
    total,
    page,
    limit,
  })
}
