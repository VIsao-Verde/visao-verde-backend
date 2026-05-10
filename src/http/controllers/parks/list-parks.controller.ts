import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { logger } from '@/lib/logger/index.js'
import { makeListParksUseCase } from '@/use-cases/factories/make-list-parks-use-case.js'

export async function list(_request: FastifyRequest, reply: FastifyReply) {
  const listParksUseCase = makeListParksUseCase()

  const { parks } = await listParksUseCase.execute()

  logger.info('Parks listed successfully!')

  return reply.status(200).send({ parks: ParkPresenter.toHTTP(parks) })
}
