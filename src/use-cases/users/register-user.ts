import { env } from '@env/index.js'
import type { UserRepository } from '@repositories/users-repository.js'
import { UserAlreadyExistsError } from '@use-cases/errors/user-already-exists-error.js'
import { hash } from 'bcryptjs'
import { Prisma, type User, type UserRole } from '@/@types/prisma/client.js'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  username: string
  role: UserRole
}

type RegisterUserUseCaseResponse = {
  user: User
}

export class RegisterUserUseCase {
  constructor(private usersRepository: UserRepository) {}

  async execute({
    name,
    email,
    cpf,
    username,
    password,
    role,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    try {
      const passwordHash = await hash(password, env.HASH_SALT_ROUNDS)

      const user = await this.usersRepository.create({
        name,
        email,
        cpf,
        username,
        passwordHash,
        role,
      })

      return { user }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new UserAlreadyExistsError()
      }

      throw error
    }
  }
}
