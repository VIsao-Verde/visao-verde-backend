import { prisma } from '@lib/prisma/index.js'
import type { UserFavoriteParksRepository } from '@repositories/user-favorite-parks-repository.js'
import { ParkAlreadyFavoritedError } from '@use-cases/errors/park-already-favorited-error.js'
import { ParkNotFavoritedError } from '@use-cases/errors/park-not-favorited-error.js'
import { Prisma } from '@/@types/prisma/client.js'

export class PrismaUserFavoriteParksRepository implements UserFavoriteParksRepository {
  async favorite(userId: string, parkId: string) {
    try {
      return await prisma.userFavoritePark.create({ data: { userId, parkId } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ParkAlreadyFavoritedError()
      }
      throw error
    }
  }

  async unfavorite(userId: string, parkId: string) {
    try {
      await prisma.userFavoritePark.delete({ where: { userId_parkId: { userId, parkId } } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new ParkNotFavoritedError()
      }
      throw error
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return await prisma.userFavoritePark.count({ where: { userId } })
  }
}
