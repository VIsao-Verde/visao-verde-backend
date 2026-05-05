import { prisma } from '@lib/prisma/index.js'
import type { ReviewRepository, ReviewData } from '@repositories/reviews-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaReviewRepository implements ReviewRepository {

    async create( userId: number, parkId: number, reviewData: ReviewData ){
        return await prisma.review.create({
            data: {
                ...reviewData,
                Park:{
                    connect: { id: parkId }
                },
                User:{
                    connect: { id: userId }
                }
            }
        })
    }

    async findBy(where: Prisma.ReviewWhereUniqueInput){
        return await prisma.review.findUnique({
            where,
        })
    }
    async listByPark(parkId: string){
        return await prisma.review.findMany({
            where: {
                parkId
            }
        })
    }

    async listByUser(userId: string): Promise<Prisma[]> {
        return await prisma.review.findMany({
            where: {
                userId
            }
        })
    }
    async delete(id: number){
        return await prisma.review.delete({
            where: { id }
        })
    }

}