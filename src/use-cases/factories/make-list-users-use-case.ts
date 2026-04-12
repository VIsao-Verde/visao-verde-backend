import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { ListUsersUseCase } from '@use-cases/users/list-users.js'

export function makeListUsersUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const listUsersUseCase = new ListUsersUseCase(usersRepository)

  return listUsersUseCase
}
