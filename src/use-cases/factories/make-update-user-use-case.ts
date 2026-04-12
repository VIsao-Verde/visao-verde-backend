import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { UpdateUserUseCase } from '@use-cases/users/update-user.js'

export function makeUpdateUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const updateUserUseCase = new UpdateUserUseCase(usersRepository)

  return updateUserUseCase
}
