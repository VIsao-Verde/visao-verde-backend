import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConquestPresenter } from '@/http/presenters/conquest-presenter.js'
import { createConquestSchema } from '@/http/schemas/conquests/create-conquest-schema.js'
import { makeCreateConquestUseCase } from '@/use-cases/factories/make-create-conquest-use-case.js'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { key, name, description } = createConquestSchema.parse(request.body)

  const createConquestUseCase = makeCreateConquestUseCase()

  const { conquest } = await createConquestUseCase.execute({
    key,
    name,
    description,
  })

  logger.info('Conquest created successfully!')

  return reply.status(201).send({ conquest: ConquestPresenter.toHTTP(conquest) })
}
