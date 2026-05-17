import { messages } from '@constants/messages.js'
import { z } from 'zod'

export const ratingNumberToEnum = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
} as const

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, { message: messages.validation.invalidRating }),
  comment: z.string().trim().max(2000).optional(),
})

export type CreateReviewSchemaType = z.infer<typeof createReviewSchema>
