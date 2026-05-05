import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { makeListParksUseCase } from '@/use-cases/factories/make-list-parks-use-case.js'

export async function list(_request: FastifyRequest, reply: FastifyReply) {
  const listParksUseCase = makeListParksUseCase()

  const { parks } = await listParksUseCase.execute()

  return reply.status(200).send({ parks: ParkPresenter.toHTTP(parks) })
}
