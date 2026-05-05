import type { Prisma, Review, Rating } from '@/@types/prisma/client.js'

export interface ReviewData {
  rating: Rating
  comment?: string
}

export interface ReviewRepository {
  create(userId: number, parkId: number, reviewData: ReviewData): Promise<Review>
  findBy(where: Prisma.ReviewWhereUniqueInput): Promise<Review | null>
  listByPark(parkId: string): Promise<Review[]>
  listByUser(userId: string): Promise<Review[]>
  delete(id: number): Promise<Review>
}
