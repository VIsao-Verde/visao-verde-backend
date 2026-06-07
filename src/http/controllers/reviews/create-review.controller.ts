import { messages } from '@constants/messages.js'
import { logger } from '@lib/logger/index.js'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { ReviewPresenter } from '@/http/presenters/review-presenter.js'
import { createReviewSchema, ratingNumberToEnum } from '@/http/schemas/reviews/create-review-schema.js'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { makeCreateReviewUseCase } from '@/use-cases/factories/make-create-review-use-case.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function createReview(request: FastifyRequest, reply: FastifyReply) {
  const { parkId } = parkIdParamsSchema.parse(request.params)

  const parts = request.parts({ limits: { fileSize: MAX_FILE_SIZE } })

  let ratingRaw: string | undefined
  let commentRaw: string | undefined
  let imageBuffer: Buffer | undefined

  for await (const part of parts) {
    if (part.type === 'field') {
      if (part.fieldname === 'rating') ratingRaw = String(part.value)
      if (part.fieldname === 'comment') commentRaw = String(part.value)
    } else {
      if (!ALLOWED_MIME_TYPES.includes(part.mimetype)) {
        await part.toBuffer()
        return reply.status(422).send({ message: messages.validation.imageInvalidType })
      }
      imageBuffer = await part.toBuffer()
    }
  }

  const { rating, comment } = createReviewSchema.parse({ rating: ratingRaw, comment: commentRaw })

  const useCase = makeCreateReviewUseCase()

  const { review } = await useCase.execute({
    userId: request.user.sub,
    parkId,
    data: {
      rating: ratingNumberToEnum[rating as keyof typeof ratingNumberToEnum],
      comment,
    },
    imageBuffer,
  })

  logger.info({ targetId: review.id, parkId }, 'Review created successfully!')

  return reply.status(201).send({ review: ReviewPresenter.toHTTP(review) })
}
