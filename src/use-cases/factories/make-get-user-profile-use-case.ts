import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository.js'
import { GetUserProfileUseCase } from '@use-cases/users/get-user-profile.js'

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository)

  return getUserProfileUseCase
}
