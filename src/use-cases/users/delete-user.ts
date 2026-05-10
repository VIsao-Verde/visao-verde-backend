import type { UserRepository } from '@repositories/users-repository.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'

interface DeleteUserUseCaseRequest {
  id: string
}

export class DeleteUserUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({ id }: DeleteUserUseCaseRequest): Promise<void> {
    const userExists = await this.usersRepository.findBy({ id })

    if (!userExists) throw new ResourceNotFoundError()

    await this.usersRepository.delete(id)
  }
}
