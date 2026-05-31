import { prisma } from '@lib/prisma/index.js'
import type { UserVisitedParksRepository } from '@repositories/user-visited-parks-repository.js'
import { ParkAlreadyVisitedError } from '@use-cases/errors/park-already-visited-error.js'
import { ParkNotVisitedError } from '@use-cases/errors/park-not-visited-error.js'
import { Prisma } from '@/@types/prisma/client.js'

export class PrismaUserVisitedParksRepository implements UserVisitedParksRepository {
  async visit(userId: string, parkId: string) {
    try {
      return await prisma.userVisitedPark.create({ data: { userId, parkId } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ParkAlreadyVisitedError()
      }
      throw error
    }
  }

  async unvisit(userId: string, parkId: string) {
    try {
      await prisma.userVisitedPark.delete({ where: { userId_parkId: { userId, parkId } } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ParkNotVisitedError()
      }
      throw error
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return await prisma.userVisitedPark.count({ where: { userId } })
  }

  async countDistinctCitiesByUserId(userId: string): Promise<number> {
    const visits = await prisma.userVisitedPark.findMany({
      where: { userId },
      include: { park: { select: { city: true } } },
    })
    return new Set(visits.map((v) => v.park.city)).size
  }
}
