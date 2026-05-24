import type { ConquestRepository } from '@repositories/conquests-repository.js'
import { ConquestNotFoundError } from '@use-cases/errors/conquest-not-found-error.js'
import type { Conquest } from '@/@types/prisma/client.js'

interface FindConquestUseCaseRequest {
  id: string
}

type FindConquestUseCaseResponse = {
  conquest: Conquest
}

export class FindConquestUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({ id }: FindConquestUseCaseRequest): Promise<FindConquestUseCaseResponse> {
    const conquest = await this.conquestsRepository.findBy({ id })

    if (!conquest) throw new ConquestNotFoundError()

    return { conquest }
  }
}
