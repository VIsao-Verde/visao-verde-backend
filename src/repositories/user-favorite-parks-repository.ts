import type { UserFavoritePark } from '@/@types/prisma/client.js'

export interface UserFavoriteParksRepository {
  favorite(userId: string, parkId: string): Promise<UserFavoritePark>
  unfavorite(userId: string, parkId: string): Promise<void>
}
