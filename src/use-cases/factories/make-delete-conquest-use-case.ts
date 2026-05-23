import { PrismaConquestRepository } from "@/repositories/prisma/prisma-conquests-repository.js";
import { DeleteConquestUseCase } from "@use-cases/conquests/delete-conquest.js";

export function makeDeleteConquestUseCase() {
    const conquestsRepository = new PrismaConquestRepository()
    const deleteConquestUseCase = new DeleteConquestUseCase(conquestsRepository)
    return deleteConquestUseCase
}