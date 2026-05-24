import { prisma } from '@lib/prisma/index.js'
import type { ConquestData, ConquestRepository } from '@repositories/conquests-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'
export class PrismaConquestRepository implements ConquestRepository {
  async create(conquestData: ConquestData) {
    return await prisma.conquest.create({
      data: conquestData,
    })
  }

  async findBy(where: Prisma.ConquestWhereUniqueInput) {
    return await prisma.conquest.findUnique({
      where,
    })
  }

  async list(page: number, limit: number) {
    const [conquests, total] = await Promise.all([
      prisma.conquest.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.conquest.count(),
    ])

    return { conquests, total }
  }

  async listByUserId(userId: string, page: number, limit: number) {
    const [userConquests, total] = await Promise.all([
      prisma.userConquest.findMany({
        where: {
          userId,
        },

        include: {
          conquest: true,
        },

        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.userConquest.count({
        where: {
          userId,
        },
      }),
    ])

    const conquests = userConquests.map((userConquest) => {
      userConquest.conquest, userConquest.achievedAt
    })

    return {
      conquests,
      total,
    }
  }

  async assignToUser(userId: string, conquestId: string) {
    return await prisma.userConquest.create({
      data: {
        userId,
        conquestId,
      },
    })
  }

  async removeFromUser(userId: string, conquestId: string) {
    return await prisma.userConquest.delete({
      where: {
        userId_conquestId: {
          userId,
          conquestId,
        },
      },
    })
  }

  async update(id: string, data: Prisma.ConquestUpdateInput) {
    return await prisma.conquest.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return await prisma.userConquest.deleteMany({
      where: { id },
    })
  }
}
