import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { makeDeleteReviewUseCase } from '@/use-cases/factories/make-delete-review-use-case.js'

export async function deleteReview(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const useCase = makeDeleteReviewUseCase()

  await useCase.execute({
    id,
    userId: request.user.sub,
    userRole: request.user.role,
  })

  logger.info({ targetId: id }, 'Review deleted successfully!')

  return reply.status(204).send()
}
