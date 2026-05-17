import { z } from 'zod'

export const listReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListReviewsSchemaType = z.infer<typeof listReviewsSchema>
