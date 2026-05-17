import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ReviewPresenter } from '@/http/presenters/review-presenter.js'
import { listReviewsSchema } from '@/http/schemas/reviews/list-reviews-schema.js'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeListReviewsByParkUseCase } from '@/use-cases/factories/make-list-reviews-by-park-use-case.js'

export async function listReviewsByPark(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)
  const { page, limit } = listReviewsSchema.parse(request.query)

  const useCase = makeListReviewsByParkUseCase()

  const { reviews, total } = await useCase.execute({ parkId, page, limit })

  logger.info({ targetId: parkId, page, limit }, 'Park reviews listed successfully!')

  return reply.status(200).send({
    reviews: ReviewPresenter.toHTTPWithUser(reviews),
    total,
    page,
    limit,
  })
}
