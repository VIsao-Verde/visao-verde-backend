import type { UserRepository } from '@repositories/users-repository.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import type { User } from '@/@types/prisma/client.js'

interface GetUserProfileUseCaseRequest {
  id: string
}

type GetUserProfileUseCaseResponse = {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({ id }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findBy({ id })

    if (!user) throw new ResourceNotFoundError()

    return { user }
  }
}
