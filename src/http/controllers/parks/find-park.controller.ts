import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { makeFindParkUseCase } from '@/use-cases/factories/make-find-park-use-case.js'

export async function find(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const findParkUseCase = makeFindParkUseCase()

  const { park } = await findParkUseCase.execute({ id })

  logger.info({ targetId: id }, 'Park fetched successfully!')

  return reply.status(200).send({ park: ParkPresenter.toHTTPWithRelations(park) })
}
