import { PrismaConquestRepository } from "@/repositories/prisma/prisma-conquests-repository.js";
import { FindConquestUseCase } from "@use-cases/conquests/find-conquest.js";

export function makeFindConquestUseCase() {
    const conquestsRepository = new PrismaConquestRepository()
    const findConquestUseCase = new FindConquestUseCase(conquestsRepository)
    return findConquestUseCase
}