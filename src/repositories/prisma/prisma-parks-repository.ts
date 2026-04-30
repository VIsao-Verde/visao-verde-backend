import { prisma } from '@lib/prisma/index.js'
import { ParkRepository } from '@repositories/parks-repository.js'
import type { Prisma } from '@/@types/prisma/client.js'

export class PrismaParksRepository implements ParkRepository {

  async create(data: Prisma.ParkCreateInput) {
        return await prisma.park.create({ data })
  }

  async findBy(where: Prisma.ParkWhereUniqueInput) {
    return await prisma.park.findUnique({
      where,
    })
  }

  async list() {
    return await prisma.park.findMany()
  }

  async update(id: number, data: Prisma.ParkUpdateInput) {
    return await prisma.park.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return await prisma.park.delete({
      where: {
        id,
      },
    })
  }

async addImage(parkId: number, imageData: Prisma.ImageCreateInput) {
  return prisma.image.create({
    data: {
      ...imageData,
      park: {
        connect: { id: parkId }
      }
    }
  })
}

  async addTrail(parkId: number, trailData: Prisma.TrailCreateInput){
      return prisma.trail.create({
        data: {
          ...trailData,
          park: {
            connect: { id: parkId }
          }
        }
      })
  }

  async listImages(parkId: number){
      return await prisma.image.findMany({
        where: {
          parkId
        }
      })
  }

  async listTrails(parkId: number){
      return await prisma.trail.findMany({
        where: {
          parkId
        }
      })
  }

  async deleteImage(imageId: number){
      return await prisma.image.delete({
        where: {
          id: imageId
        }
      })
  }

  async deleteTrail(trailId: number){
      return await prisma.trail.delete({
        where: {
          id: trailId
        }
      })
  }
  
}