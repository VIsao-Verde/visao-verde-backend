import { z } from 'zod'

export const listConquestsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const listConquestsByUserIdSchema = z.object({
  userId: z.string().uuid(),
})

export type ListConquestsSchemaType = z.infer<typeof listConquestsSchema>
