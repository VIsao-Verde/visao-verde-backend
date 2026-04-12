import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { RegisterUserUseCase } from '@use-cases/users/register-user.js'

export function makeRegisterUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUserUseCase(usersRepository)

  return registerUseCase
}
