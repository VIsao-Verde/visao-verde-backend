import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { ForgotPasswordUseCase } from '@use-cases/users/forgot-password.js'

export function makeForgotPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const forgotPasswordUseCase = new ForgotPasswordUseCase(usersRepository)

  return forgotPasswordUseCase
}
