import type { UserRepository } from '@repositories/users-repository.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'

interface DeleteUserUseCaseRequest {
  publicId: string
}

export class DeleteUserUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({ publicId }: DeleteUserUseCaseRequest): Promise<void> {
    const userExists = await this.usersRepository.findBy({ publicId })

    if (!userExists) throw new ResourceNotFoundError()

    await this.usersRepository.delete(userExists.id)
  }
}
