import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { ResetPasswordUseCase } from '@use-cases/users/reset-password.js'

export function makeResetPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const resetPasswordUseCase = new ResetPasswordUseCase(usersRepository)

  return resetPasswordUseCase
}
