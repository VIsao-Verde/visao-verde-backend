import { logger } from '@lib/logger/index.js'
import { makeDeleteParkImageUseCase } from '@use-cases/factories/make-delete-park-image-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { imageParamsSchema } from '@/http/schemas/parks/image-params-schema.js'

export async function deleteParkImage(request: FastifyRequest, reply: FastifyReply) {
  const { id: parkId, imageId } = imageParamsSchema.parse(request.params)

  const deleteParkImageUseCase = makeDeleteParkImageUseCase()

  await deleteParkImageUseCase.execute({ parkId, imageId })

  logger.info({ parkId, imageId }, 'Park image deleted successfully!')

  return reply.status(204).send()
}
