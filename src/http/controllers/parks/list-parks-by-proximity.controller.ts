import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { nearbyParksSchema } from '@/http/schemas/parks/nearby-parks-schema.js'
import { logger } from '@/lib/logger/index.js'
import { makeListParksByProximityUseCase } from '@/use-cases/factories/make-list-parks-by-proximity-use-case.js'

export async function listNearby(request: FastifyRequest, reply: FastifyReply) {
  const { latitude, longitude, radius } = nearbyParksSchema.parse(request.query)

  const listParksByProximityUseCase = makeListParksByProximityUseCase()

  const { parks } = await listParksByProximityUseCase.execute({
    latitude,
    longitude,
    radiusKm: radius,
  })

  logger.info({ latitude, longitude, radius }, 'Nearby parks listed successfully!')

  return reply.status(200).send({ parks: ParkPresenter.toHTTPWithDistance(parks) })
}
