import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeVisitParkUseCase } from '@/use-cases/factories/make-visit-park-use-case.js'

export async function visitPark(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)

  const visitParkUseCase = makeVisitParkUseCase()

  const { visit } = await visitParkUseCase.execute({
    userId: request.user.sub,
    parkId,
  })

  logger.info({ targetId: parkId }, 'Park visited successfully!')

  return reply.status(201).send({ visitedAt: visit.visitedAt })
}
