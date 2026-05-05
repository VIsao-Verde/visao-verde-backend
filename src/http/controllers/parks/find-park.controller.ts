import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { publicIdSchema } from '@/http/schemas/utils/public-id-schema.js'
import { ParkNotFoundError } from '@/use-cases/errors/park-not-found-error.js'
import { makeFindParkUseCase } from '@/use-cases/factories/make-find-park-use-case.js'

export async function find(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { publicId } = publicIdSchema.parse(request.params)

    const findParkUseCase = makeFindParkUseCase()

    const { park } = await findParkUseCase.execute({ publicId })

    return reply.status(200).send({ park: ParkPresenter.toHTTP(park) })
  } catch (error) {
    if (error instanceof ParkNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
