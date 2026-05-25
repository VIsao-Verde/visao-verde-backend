import { z } from 'zod'

export const listParksSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  name: z.string().trim().optional(),
  favorited: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  visited: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type ListParksSchemaType = z.infer<typeof listParksSchema>
