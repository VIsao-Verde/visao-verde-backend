import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeUnvisitParkUseCase } from '@/use-cases/factories/make-unvisit-park-use-case.js'

export async function unvisitPark(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)

  const unvisitParkUseCase = makeUnvisitParkUseCase()

  await unvisitParkUseCase.execute({
    userId: request.user.sub,
    parkId,
  })

  logger.info({ targetId: parkId }, 'Park unvisited successfully!')

  return reply.status(204).send()
}
