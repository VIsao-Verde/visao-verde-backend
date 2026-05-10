import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { makeDeleteParkUseCase } from '@/use-cases/factories/make-delete-park-use-case.js'

export async function deletePark(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const deleteParkUseCase = makeDeleteParkUseCase()

  await deleteParkUseCase.execute({ id })

  logger.info({ targetId: id }, 'Park deleted successfully!')

  return reply.status(204).send()
}
