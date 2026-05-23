import type { Conquest } from '@/@types/prisma/client.js'
import { ConquestsWithAchievedAt } from '@/repositories/conquests-repository.js'

type HTTPConquest = {
  id: string
  name: string
  description: string | null
}

type HTTPConquestWithAchievedAt = {
  id: string
  name: string
  description: string | null
  UserConquest: {
    achievedAt: Date
  }
}

export class ConquestPresenter {
  static toHTTP(conquest: Conquest): HTTPConquest
  static toHTTP(conquests: Conquest[]): HTTPConquest[]
  static toHTTP(conquests: ConquestsWithAchievedAt[]): HTTPConquestWithAchievedAt[]
  static toHTTP(input: Conquest | Conquest[]): HTTPConquest | HTTPConquest[] {
    if (Array.isArray(input)) {
      return input.map((c) => ConquestPresenter.toHTTP(c))
    }

    return {
      id: input.id,
      name: input.name,
      description: input.description,
    }
  }
}
