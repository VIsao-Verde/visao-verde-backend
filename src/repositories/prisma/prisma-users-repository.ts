import { prisma } from '@lib/prisma/index.js'
import type { UserRepository } from '@repositories/users-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaUsersRepository implements UserRepository {
  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({ data })
  }

  async findBy(where: Prisma.UserWhereUniqueInput) {
    return await prisma.user.findUnique({
      where,
    })
  }

  async list() {
    return await prisma.user.findMany()
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return await prisma.user.delete({
      where: {
        id,
      },
    })
  }
}
