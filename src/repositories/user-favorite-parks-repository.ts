import type { ParkWithImages } from '@repositories/parks-repository.js'
import type { UserFavoritePark } from '@/@types/prisma/client.js'

export type FavoriteParkWithDetails = ParkWithImages & {
  favoritedAt: Date
  lastVisitedAt: Date | null
}

export interface UserFavoriteParksRepository {
  favorite(userId: string, parkId: string): Promise<UserFavoritePark>
  unfavorite(userId: string, parkId: string): Promise<void>
  list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ favorites: FavoriteParkWithDetails[]; total: number }>
}
