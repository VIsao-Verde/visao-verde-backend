import { UserPresenter } from '@http/presenters/user-presenter.js'
import { idSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import { makeGetUserProfileUseCase } from '@use-cases/factories/make-get-user-profile-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function getUserProfile(request: FastifyRequest, reply: FastifyReply) {
  const getUserProfileUseCase = makeGetUserProfileUseCase()

  const { user } = await getUserProfileUseCase.execute({ id: request.user.sub })

  logger.info('User profile retrieved successfully!')

  return reply.status(200).send(UserPresenter.toHTTP(user))
}

export async function getUserById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const getUserProfileUseCase = makeGetUserProfileUseCase()

  const { user } = await getUserProfileUseCase.execute({ id })

  logger.info('User retrieved successfully!')

  return reply.status(200).send(UserPresenter.toHTTP(user))
}
