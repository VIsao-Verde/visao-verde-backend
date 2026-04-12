import { env } from '@env/index.js'
import type { UserRepository } from '@repositories/users-repository.js'
import { InvalidTokenError } from '@use-cases/errors/invalid-token-error.js'
import { hash } from 'bcryptjs'
import type { User } from '@/@types/prisma/client.js'

interface ResetPasswordUseCaseCaseRequest {
  token: string
  password: string
}

type ResetPasswordUseCaseCaseResponse = {
  user: User
}

export class ResetPasswordUseCase {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ token, password }: ResetPasswordUseCaseCaseRequest): Promise<ResetPasswordUseCaseCaseResponse> {
    const passwordHash = await hash(password, env.HASH_SALT_ROUNDS)

    const userExists = await this.usersRepository.findBy({ token })

    if (!userExists?.tokenExpiresAt || userExists.tokenExpiresAt < new Date()) {
      throw new InvalidTokenError()
    }

    const user = await this.usersRepository.update(userExists.id, {
      passwordHash,
    })

    return { user }
  }
}
