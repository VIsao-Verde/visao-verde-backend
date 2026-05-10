import { UserRole } from '@/@types/prisma/client.js'
import { UserPresenter } from '@http/presenters/user-presenter.js'
import { registerSchema } from '@http/schemas/users/register-schema.js'
import { logger } from '@lib/logger/index.js'
import { makeRegisterUserUseCase } from '@use-cases/factories/make-register-user-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, cpf, username, password } = registerSchema.parse(request.body)

  const registerUseCase = makeRegisterUserUseCase()

  const { user } = await registerUseCase.execute({
    name,
    email,
    cpf,
    password,
    username,
    role: UserRole.DEFAULT,
  })

  logger.info({ userId: user.id }, 'Researcher registered successfully!')

  return reply.status(201).send({ user: UserPresenter.toHTTP(user) })
}

export async function registerAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, cpf, username, password } = registerSchema.parse(request.body)

  const registerUseCase = makeRegisterUserUseCase()

  const { user } = await registerUseCase.execute({ name, email, cpf, username, password, role: UserRole.ADMIN })

  return reply.status(201).send({ user: UserPresenter.toHTTP(user) })
}
