import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { AuthenticateUserUseCase } from '@use-cases/users/authenticate-user.js'

export function makeAuthenticateUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

  return authenticateUserUseCase
}
