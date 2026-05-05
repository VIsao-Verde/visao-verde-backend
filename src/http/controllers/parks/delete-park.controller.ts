import type { FastifyReply, FastifyRequest } from 'fastify'
import { publicIdSchema } from '@/http/schemas/utils/public-id-schema.js'
import { logger } from '@/lib/logger/index.js'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.js'
import { makeDeleteParkUseCase } from '@/use-cases/factories/make-delete-park-use-case.js'

export async function deletePark(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { publicId } = publicIdSchema.parse(request.params)

    const deleteParkUseCase = makeDeleteParkUseCase()

    await deleteParkUseCase.execute({ publicId })

    logger.info({ targetId: publicId }, 'Park deleted successfully!')

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
