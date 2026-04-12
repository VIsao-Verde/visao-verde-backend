import { randomBytes } from 'node:crypto'
import { emailSchema } from '@http/schemas/utils/email.js'
import type { UserRepository } from '@repositories/users-repository.js'
import { UserNotFoundForPasswordResetError } from '@use-cases/errors/user-not-found-for-password-reset-error.js'
import type { User } from '@/@types/prisma/client.js'

interface ForgotPasswordUseCaseRequest {
  login: string
}

type ForgotPasswordUseCaseResponse = {
  user: User
  token: string
}

const EXPIRES_IN_MINUTES = 15
const TOKEN_LENGTH = 32

export class ForgotPasswordUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({ login }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    let userExists: User | null = null

    if (emailSchema.safeParse(login).success) {
      userExists = await this.usersRepository.findBy({ email: login })
    } else {
      userExists = await this.usersRepository.findBy({ username: login })
    }

    const passwordToken = randomBytes(TOKEN_LENGTH).toString('hex')

    const tokenExpiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000)

    const tokenData = {
      token: passwordToken,
      tokenExpiresAt,
    }

    if (!userExists) throw new UserNotFoundForPasswordResetError()

    const user = await this.usersRepository.update(userExists.id, {
      ...tokenData,
    })

    return {
      user,
      token: passwordToken,
    }
  }
}
