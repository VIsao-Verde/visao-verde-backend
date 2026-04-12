import { UserPresenter } from '@http/presenters/user-presenter.js'
import { updateSchema } from '@http/schemas/users/update-schema.js'
import { publicIdSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import { makeUpdateUserUseCase } from '@use-cases/factories/make-update-user-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email, password } = updateSchema.parse(request.body)

    const updateUserUseCase = makeUpdateUserUseCase()

    const { user } = await updateUserUseCase.execute({
      publicId: request.user.sub,
      name,
      email,
      password,
    })

    logger.info('User updated successfully!')

    return reply.status(200).send(UserPresenter.toHTTP(user))
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

export async function updateUserByPublicId(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, email, password } = updateSchema.parse(request.body)
    const { publicId } = publicIdSchema.parse(request.params)

    const updateUserUseCase = makeUpdateUserUseCase()

    const { user } = await updateUserUseCase.execute({
      publicId,
      name,
      email,
      password,
    })

    logger.info('User updated successfully!')

    return reply.status(200).send(UserPresenter.toHTTP(user))
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
