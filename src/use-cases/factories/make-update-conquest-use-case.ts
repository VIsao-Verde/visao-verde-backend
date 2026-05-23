import { PrismaConquestRepository } from "@/repositories/prisma/prisma-conquests-repository.js";
import { UpdateConquestUseCase } from "@/use-cases/conquests/update-conquest.js";

export function makeUpdateConquestUseCase() {
    const conquestsRepository = new PrismaConquestRepository()
    const updateConquestUseCase = new UpdateConquestUseCase(conquestsRepository)
    return updateConquestUseCase
}