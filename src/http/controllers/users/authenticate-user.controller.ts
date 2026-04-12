import { UserPresenter } from '@http/presenters/user-presenter.js'
import { authenticateSchema } from '@http/schemas/users/authenticate-schema.js'
import { logger } from '@lib/logger/index.js'
import { InvalidCredentialsError } from '@use-cases/errors/invalid-credentials-error.js'
import { makeAuthenticateUserUseCase } from '@use-cases/factories/make-authenticate-user-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { login, password } = authenticateSchema.parse(request.body)

    const authenticateUserUseCase = makeAuthenticateUserUseCase()

    const { user } = await authenticateUserUseCase.execute({ login, password })

    logger.info('User authenticated successfully!')

    const token = await reply.jwtSign({ sub: user.publicId, role: user.role }, { expiresIn: '1d' })

    return reply.status(200).send({ token, user: UserPresenter.toHTTP(user) })
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
