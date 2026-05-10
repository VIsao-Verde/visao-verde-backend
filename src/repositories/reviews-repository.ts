import type { Prisma, Rating, Review } from '@/@types/prisma/client.js'

export interface ReviewData {
  rating: Rating
  comment?: string
}

export interface ReviewRepository {
  create(userId: string, parkId: string, reviewData: ReviewData): Promise<Review>
  findBy(where: Prisma.ReviewWhereUniqueInput): Promise<Review | null>
  listByPark(parkId: string): Promise<Review[]>
  listByUser(userId: string): Promise<Review[]>
  delete(id: string): Promise<Review>
}
