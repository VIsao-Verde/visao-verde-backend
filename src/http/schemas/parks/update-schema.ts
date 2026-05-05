import { z } from 'zod'

export const updateSchema = z.object({
  name: z.string().trim().min(4).optional(),
  description: z.string().trim().min(10).optional(),
  city: z.string().trim().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type updateSchemaType = z.infer<typeof updateSchema>
