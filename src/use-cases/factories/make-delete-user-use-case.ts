import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { DeleteUserUseCase } from '@use-cases/users/delete-user.js'

export function makeDeleteUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const deleteUserUseCase = new DeleteUserUseCase(usersRepository)

  return deleteUserUseCase
}
