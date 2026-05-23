import { z } from 'zod'

export const updateSchema = z.object({
  name: z.string().trim().min(4).optional(),
  description: z.string().trim().min(10).optional(),
})

export type updateSchemaType = z.infer<typeof updateSchema>
