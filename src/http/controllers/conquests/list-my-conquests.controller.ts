import type { FastifyReply, FastifyRequest } from 'fastify'
import { ConquestPresenter } from '@/http/presenters/conquest-presenter.js'
import { listConquestsSchema } from '@/http/schemas/conquests/list-conquests-schema.js'
import { logger } from '@/lib/logger/index.js'
import { makeListConquestsByUserIdUseCase } from '@/use-cases/factories/make-list-conquests-by-user-id-use-case.js'

export async function listMyConquests(request: FastifyRequest, reply: FastifyReply) {
  const { page, limit } = listConquestsSchema.parse(request.query)

  const listConquestsByUserIdUseCase = makeListConquestsByUserIdUseCase()

  const { conquests, total } = await listConquestsByUserIdUseCase.execute({
    userId: request.user.sub,
    page,
    limit,
  })

  logger.info({ page, limit }, 'My conquests listed successfully!')

  return reply.status(200).send({ conquests: ConquestPresenter.toHTTP(conquests), total, page, limit })
}
