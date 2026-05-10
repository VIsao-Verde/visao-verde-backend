import { updateSchema } from '@http/schemas/parks/update-schema.js'
import { idSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import { makeUpdateParkUseCase } from '@use-cases/factories/make-update-park-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { name, description, city, latitude, longitude } = updateSchema.parse(request.body)
  const { id } = idSchema.parse(request.params)

  const updateParkUseCase = makeUpdateParkUseCase()

  const { park } = await updateParkUseCase.execute({
    id,
    name,
    description,
    city,
    latitude,
    longitude,
  })

  logger.info('Park updated successfully!')

  return reply.status(200).send({ park: ParkPresenter.toHTTP(park) })
}
