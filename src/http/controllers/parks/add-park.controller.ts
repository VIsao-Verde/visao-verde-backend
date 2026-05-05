import type { FastifyReply, FastifyRequest } from 'fastify'
import { ParkPresenter } from '@/http/presenters/park-presenter.js'
import { addParkSchema } from '@/http/schemas/parks/add-park-schema.js'
import { ParkAlreadyExistsError } from '@/use-cases/errors/park-already-exists-error.js'
import { makeAddParkUseCase } from '@/use-cases/factories/make-add-park-use-case.js'

export async function add(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, description, city, latitude, longitude } = addParkSchema.parse(request.body)

    const addParkUseCase = makeAddParkUseCase()

    const { park } = await addParkUseCase.execute({
      name,
      description,
      city,
      latitude,
      longitude,
    })

    return reply.status(201).send({ park: ParkPresenter.toHTTP(park) })
  } catch (error) {
    if (error instanceof ParkAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
