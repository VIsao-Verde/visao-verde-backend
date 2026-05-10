import { UserPresenter } from '@http/presenters/user-presenter.js'
import { updateSchema } from '@http/schemas/users/update-schema.js'
import { idSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import { makeUpdateUserUseCase } from '@use-cases/factories/make-update-user-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = updateSchema.parse(request.body)

  const updateUserUseCase = makeUpdateUserUseCase()

  const { user } = await updateUserUseCase.execute({
    id: request.user.sub,
    name,
    email,
    password,
  })

  logger.info('User updated successfully!')

  return reply.status(200).send(UserPresenter.toHTTP(user))
}

export async function updateUserById(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = updateSchema.parse(request.body)
  const { id } = idSchema.parse(request.params)

  const updateUserUseCase = makeUpdateUserUseCase()

  const { user } = await updateUserUseCase.execute({ id, name, email, password })

  logger.info('User updated successfully!')

  return reply.status(200).send(UserPresenter.toHTTP(user))
}
