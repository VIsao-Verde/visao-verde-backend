import { idSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import { makeDeleteUserUseCase } from '@use-cases/factories/make-delete-user-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const deleteUserUseCase = makeDeleteUserUseCase()

    await deleteUserUseCase.execute({ id: request.user.sub })

    logger.info('User deleted successfully!')

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

export async function deleteUserById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = idSchema.parse(request.params)

    const deleteUserUseCase = makeDeleteUserUseCase()

    await deleteUserUseCase.execute({ id })

    logger.info({ targetId: id }, 'User deleted successfully!')

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
