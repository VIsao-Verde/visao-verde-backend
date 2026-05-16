import { messages } from '@constants/messages.js'
import { logger } from '@lib/logger/index.js'
import { makeAddParkImageUseCase } from '@use-cases/factories/make-add-park-image-use-case.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { idSchema } from '@/http/schemas/utils/public-id-schema.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function addParkImage(request: FastifyRequest, reply: FastifyReply) {
  const { id: parkId } = idSchema.parse(request.params)

  const file = await request.file({ limits: { fileSize: MAX_FILE_SIZE } })

  if (!file) {
    return reply.status(400).send({ message: messages.validation.imageInvalidType })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    await file.toBuffer()
    return reply.status(422).send({ message: messages.validation.imageInvalidType })
  }

  const buffer = await file.toBuffer()

  const addParkImageUseCase = makeAddParkImageUseCase()

  const { image } = await addParkImageUseCase.execute({ parkId, buffer })

  logger.info({ parkId, imageId: image.id }, 'Park image added successfully!')

  return reply.status(201).send({ image: { id: image.id, url: image.url, createdAt: image.createdAt } })
}
