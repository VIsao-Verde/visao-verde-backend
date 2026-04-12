import { env } from '@env/index.js'
import type { UserRepository } from '@repositories/users-repository.js'
import { ResourceNotFoundError } from '@use-cases/errors/resource-not-found-error.js'
import { hash } from 'bcryptjs'
import type { User } from '@/@types/prisma/client.js'

interface UpdateUserUseCaseRequest {
  publicId: string
  name?: string
  email?: string
  username?: string
  cpf?: string
  password?: string
}

type UpdateUserUseCaseResponse = {
  user: User
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({ publicId, password, ...data }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const userToUpdate = await this.usersRepository.findBy({ publicId })

    if (!userToUpdate) throw new ResourceNotFoundError()

    let passwordHash: string | undefined
    let passwordChangedAt: Date | undefined

    if (password) {
      passwordHash = await hash(password, env.HASH_SALT_ROUNDS)
      passwordChangedAt = new Date()
    }

    const user = await this.usersRepository.update(userToUpdate.id, {
      passwordHash,
      passwordChangedAt,
      ...data,
    })

    return { user }
  }
}
