import { z } from 'zod'

export const createConquestSchema = z.object({
  name: z.string().trim().min(4).max(255),
  description: z.string().optional().default(''),
})

export type createConquestSchemaType = z.infer<typeof createConquestSchema>