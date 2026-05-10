import type { User, UserRole } from '@/@types/prisma/client.js'

type HTTPUser = {
  id: string
  name: string
  email: string
  cpf: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export class UserPresenter {
  static toHTTP(user: User): HTTPUser
  static toHTTP(users: User[]): HTTPUser[]
  static toHTTP(input: User | User[]): HTTPUser | HTTPUser[] {
    if (Array.isArray(input)) {
      return input.map((u) => UserPresenter.toHTTP(u))
    }

    return {
      id: input.id,
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      role: input.role,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }
  }
}
