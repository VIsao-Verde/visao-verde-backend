import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeFavoriteParkUseCase } from '@/use-cases/factories/make-favorite-park-use-case.js'

export async function favoritePark(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)

  const favoriteParkUseCase = makeFavoriteParkUseCase()

  const { favorite } = await favoriteParkUseCase.execute({
    userId: request.user.sub,
    parkId,
  })

  logger.info({ targetId: parkId }, 'Park favorited successfully!')

  return reply.status(201).send({ favoritedAt: favorite.favoritedAt })
}
