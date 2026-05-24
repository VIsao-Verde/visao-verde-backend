import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeUnfavoriteParkUseCase } from '@/use-cases/factories/make-unfavorite-park-use-case.js'

export async function unfavoritePark(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)

  const unfavoriteParkUseCase = makeUnfavoriteParkUseCase()

  await unfavoriteParkUseCase.execute({
    userId: request.user.sub,
    parkId,
  })

  logger.info({ targetId: parkId }, 'Park unfavorited successfully!')

  return reply.status(204).send()
}
