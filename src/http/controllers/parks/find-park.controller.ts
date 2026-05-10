import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { ParkNotFoundError } from '@/use-cases/errors/park-not-found-error.js'
import { makeFindParkUseCase } from '@/use-cases/factories/make-find-park-use-case.js'
import { logger } from '@/lib/logger/index.js'

export async function find(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = idSchema.parse(request.params)

    const findParkUseCase = makeFindParkUseCase()

    const { park } = await findParkUseCase.execute({ id })

    logger.info({ targetId: id }, 'Park fetched successfully!')

    return reply.status(200).send({ park: ParkPresenter.toHTTPWithRelations(park) })
  } catch (error) {
    if (error instanceof ParkNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
