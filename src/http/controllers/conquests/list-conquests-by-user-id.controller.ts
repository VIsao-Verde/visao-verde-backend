import { ConquestPresenter } from "@/http/presenters/conquest-presenter.js";
import { listConquestsByUserIdSchema, listConquestsSchema } from "@/http/schemas/conquests/list-conquests-schema.js";
import { logger } from "@/lib/logger/index.js";
import { makeListConquestsByUserIdUseCase } from "@/use-cases/factories/make-list-conquests-by-user-id-use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listByUser(request: FastifyRequest, reply: FastifyReply) {
    const { page, limit } = listConquestsSchema.parse(request.query)
    const { userId } = listConquestsByUserIdSchema.parse(request.params)

    const listConquestsByUserIdUseCase = makeListConquestsByUserIdUseCase()

    const {conquests, total} = await listConquestsByUserIdUseCase.execute({ userId, page, limit })

    logger.info({ page, limit }, 'Conquests listed successfully!')

    return reply.status(200).send({ conquests: ConquestPresenter.toHTTP(conquests), total, page, limit })
}