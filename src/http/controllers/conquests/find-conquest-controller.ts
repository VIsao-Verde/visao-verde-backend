import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'
import { makeFindConquestUseCase } from '@/use-cases/factories/make-find-conquest-use-case.js'
import { ConquestPresenter } from '@/http/presenters/conquest-presenter.js'

export async function find(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(request.params)

  const findConquestUseCase = makeFindConquestUseCase()

  const { conquest } = await findConquestUseCase.execute({ id })

  logger.info({ targetId: id }, 'Conquest fetched successfully!')

  return reply.status(200).send({ conquest: ConquestPresenter.toHTTP(conquest) })
}
