import type { Conquest } from '@/@types/prisma/client.js'

type HTTPConquest = {
  id: string
  name: string
  description: string | null
}

export class ConquestPresenter {
  static toHTTP(conquest: Conquest): HTTPConquest
  static toHTTP(conquests: Conquest[]): HTTPConquest[]
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
