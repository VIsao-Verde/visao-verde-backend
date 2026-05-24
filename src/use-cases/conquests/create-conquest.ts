import type { ConquestRepository } from '@repositories/conquests-repository.js'
import { ConquestAlreadyExistsError } from '@use-cases/errors/conquest-already-exists-error.js'
import { type Conquest, Prisma } from '@/@types/prisma/client.js'

interface CreateConquestUseCaseRequest {
  name: string
  description?: string
}

type CreateConquestUseCaseResponse = {
  conquest: Conquest
}

export class CreateConquestUseCase {
  constructor(private conquestsRepository: ConquestRepository) {}

  async execute({ name, description }: CreateConquestUseCaseRequest): Promise<CreateConquestUseCaseResponse> {
    try {
      const conquest = await this.conquestsRepository.create({
        name,
        description,
      })

      return { conquest }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConquestAlreadyExistsError()
      }

      throw error
    }
  }
}
