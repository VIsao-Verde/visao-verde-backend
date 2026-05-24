import type { Conquest, Prisma } from '@/@types/prisma/client.js'

export interface ConquestData {
  name: Prisma.ConquestCreateInput['name']
  description?: Prisma.ConquestCreateInput['description']
}

export type ConquestsWithAchievedAt = Prisma.ConquestGetPayload<{
  include: {
    user_conquests: { select: { achievedAt: true } }
  }
}>

export interface ConquestRepository {
  create(conquestData: ConquestData): Promise<Conquest>
  findBy(where: Prisma.ConquestWhereUniqueInput): Promise<Conquest | null>
  list(page: number, limit: number): Promise<{ conquests: Conquest[]; total: number }>
  listByUserId(userId: string, page: number, limit: number): Promise<{ conquests: Conquest[]; total: number }>
  update(id: string, data: Prisma.ConquestUpdateInput): Promise<Conquest>
  delete(id: string): Promise<Conquest>
}
