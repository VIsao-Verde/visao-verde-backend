import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { makeDeleteConquestUseCase } from '@/use-cases/factories/make-delete-conquest-use-case.js'

export async function deleteConquest(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const deleteConquestUseCase = makeDeleteConquestUseCase()

  await deleteConquestUseCase.execute({ id })

  logger.info({ targetId: id }, 'Conquest deleted successfully!')

  return reply.status(204).send()
}
