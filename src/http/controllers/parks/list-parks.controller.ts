import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { listParksSchema } from '@/http/schemas/parks/list-parks-schema.js'
import { logger } from '@/lib/logger/index.js'
import { makeListParksUseCase } from '@/use-cases/factories/make-list-parks-use-case.js'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit, name, favorited, visited, category, source } = listParksSchema.parse(request.query)

  const listParksUseCase = makeListParksUseCase()

  const { parks, total } = await listParksUseCase.execute({
    page,
    limit,
    userId: request.user.sub,
    filters: { name, favorited, visited, category, source },
  })

  logger.info({ page, limit }, 'Parks listed successfully!')

  return reply.status(200).send({ parks: ParkPresenter.toHTTPWithImages(parks), total, page, limit })
}
