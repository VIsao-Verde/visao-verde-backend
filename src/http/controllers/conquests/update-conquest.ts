import { updateSchema } from '@http/schemas/conquests/update-schema.js'
import { idSchema } from '@http/schemas/utils/public-id-schema.js'
import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { makeUpdateConquestUseCase } from '@/use-cases/factories/make-update-conquest-use-case.js'
import { ConquestPresenter } from '@/http/presenters/conquest-presenter.js'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { name, description } = updateSchema.parse(request.body)
  const { id } = idSchema.parse(request.params)

  const updateConquestUseCase = makeUpdateConquestUseCase()

  const { conquest } = await updateConquestUseCase.execute({
    id,
    name,
    description,
  })

  logger.info(`Conquest: ${conquest.id} updated successfully!`)

  return reply.status(200).send({ conquest: ConquestPresenter.toHTTP(conquest) })
}
