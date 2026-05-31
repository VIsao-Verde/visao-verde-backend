import type { Conquest, Prisma, UserConquest } from '@/@types/prisma/client.js'

export interface ConquestData {
  key: string
  name: Prisma.ConquestCreateInput['name']
  description?: Prisma.ConquestCreateInput['description']
}

export type ConquestsWithAchievedAt = Prisma.ConquestGetPayload<{
  include: {
    user: { select: { achievedAt: true } }
  }
}>

export interface ConquestRepository {
  create(conquestData: ConquestData): Promise<Conquest>
  findBy(where: Prisma.ConquestWhereUniqueInput): Promise<Conquest | null>
  findAll(): Promise<Conquest[]>
  findAllEarnedByUserId(userId: string): Promise<string[]>
  assignToUser(userId: string, conquestId: string): Promise<UserConquest>
  list(page: number, limit: number): Promise<{ conquests: Conquest[]; total: number }>
  listByUserId(userId: string, page: number, limit: number): Promise<{ conquests: ConquestsWithAchievedAt[]; total: number }>
  update(id: string, data: Prisma.ConquestUpdateInput): Promise<Conquest>
  delete(id: string): Promise<Conquest>
}
