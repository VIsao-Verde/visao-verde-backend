import { ConquestNotFoundError } from '@use-cases/errors/conquest-not-found-error.js'
import type { Conquest } from '@/@types/prisma/client.js'
import type { ConquestRepository } from '@/repositories/conquests-repository.js'

interface UpdateConquestUseCaseRequest {
  id: string
  name?: string
  description?: string
}

type UpdateConquestUseCaseResponse = {
  conquest: Conquest
}

export class UpdateConquestUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({ id, ...data }: UpdateConquestUseCaseRequest): Promise<UpdateConquestUseCaseResponse> {
    const conquestExists = await this.conquestsRepository.findBy({ id })

    if (!conquestExists) throw new ConquestNotFoundError()

    const conquest = await this.conquestsRepository.update(id, data)

    return { conquest }
  }
}
