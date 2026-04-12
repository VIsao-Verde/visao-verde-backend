import { UserPresenter } from '@http/presenters/user-presenter.js'
import { logger } from '@lib/logger/index.js'
import { makeListUsersUseCase } from '@use-cases/factories/make-list-users-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function listUsers(_request: FastifyRequest, reply: FastifyReply) {
  const listUsers = makeListUsersUseCase()

  const { users } = await listUsers.execute()

  logger.info('Admins retrieved successfully!')

  return reply.status(200).send({ admins: UserPresenter.toHTTP(users) })
}
