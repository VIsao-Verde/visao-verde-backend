import type { UserVisitedPark } from '@/@types/prisma/client.js'

export interface UserVisitedParksRepository {
  visit(userId: string, parkId: string): Promise<UserVisitedPark>
  unvisit(userId: string, parkId: string): Promise<void>
  countByUserId(userId: string): Promise<number>
  countDistinctCitiesByUserId(userId: string): Promise<number>
}
