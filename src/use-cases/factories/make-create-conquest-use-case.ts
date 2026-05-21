import { PrismaConquestRepository } from "@/repositories/prisma/prisma-conquests-repository.js";
import { CreateConquestUseCase } from "@/use-cases/conquests/create-conquest.js";

export function makeCreateConquestUseCase() {
    const conquestRepository = new PrismaConquestRepository()
    const createConquestUseCase = new CreateConquestUseCase(conquestRepository)
    return createConquestUseCase
}