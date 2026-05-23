import { ConquestPresenter } from "@/http/presenters/conquest-presenter.js";
import { listConquestsSchema } from "@/http/schemas/conquests/list-conquests-schema.js";
import { logger } from "@/lib/logger/index.js";
import { makeListConquestsUseCase } from "@/use-cases/factories/make-list-conquests-use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";

export async function list(request: FastifyRequest, reply: FastifyReply) {
    const { page, limit } = listConquestsSchema.parse(request.query)

    const listConquestsUseCase = makeListConquestsUseCase()

    const {conquests, total} = await listConquestsUseCase.execute({ page, limit })

    logger.info({ page, limit }, 'Conquests listed successfully!')

    return reply.status(200).send({ conquests: ConquestPresenter.toHTTP(conquests), total, page, limit })
}