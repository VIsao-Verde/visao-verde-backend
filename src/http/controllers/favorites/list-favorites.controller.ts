import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { listFavoritesSchema } from '@/http/schemas/favorites/list-favorites-schema.js'
import { makeListFavoritesUseCase } from '@/use-cases/factories/make-list-favorites-use-case.js'

export async function listFavorites(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = listFavoritesSchema.parse(request.query)

  const listFavoritesUseCase = makeListFavoritesUseCase()

  const { favorites, total } = await listFavoritesUseCase.execute({
    userId: request.user.sub,
    page,
    limit,
  })

  logger.info({ page, limit }, 'Favorites listed successfully!')

  return reply.status(200).send({
    favorites: ParkPresenter.toHTTPFavorites(favorites),
    total,
    page,
    limit,
  })
}
