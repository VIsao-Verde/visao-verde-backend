import type { Prisma, Review } from '@/@types/prisma/client.js'

export interface ReviewData {
  id?: string
  rating: Prisma.ReviewCreateInput['rating']
  comment?: string
  imageUrl?: string
}

export type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: { user: { select: { id: true; name: true } } }
}>

export type ReviewWithPark = Prisma.ReviewGetPayload<{
  include: { park: { select: { id: true; name: true; city: true } } }
}>

export interface ReviewRepository {
  create(userId: string, parkId: string, reviewData: ReviewData): Promise<Review>
  findBy(where: Prisma.ReviewWhereUniqueInput): Promise<Review | null>
  listByPark(parkId: string, page: number, limit: number): Promise<{ reviews: ReviewWithUser[]; total: number }>
  listByUser(userId: string, page: number, limit: number): Promise<{ reviews: ReviewWithPark[]; total: number }>
  countByUserId(userId: string): Promise<number>
  delete(id: string): Promise<Review>
}
