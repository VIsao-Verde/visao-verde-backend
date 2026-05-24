import { ConquestNotFoundError } from '@use-cases/errors/conquest-not-found-error.js'
import type { ConquestRepository } from '@/repositories/conquests-repository.js'

interface DeleteConquestUseCaseRequest {
  id: string
}

export class DeleteConquestUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({ id }: DeleteConquestUseCaseRequest): Promise<void> {
    const conquestExists = await this.conquestsRepository.findBy({ id })

    if (!conquestExists) throw new ConquestNotFoundError()

    await this.conquestsRepository.delete(id)
  }
}
