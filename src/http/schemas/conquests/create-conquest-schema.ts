import { z } from 'zod'

export const createConquestSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[A-Z_]+$/, 'Key must contain only uppercase letters and underscores'),
  name: z.string().trim().min(4).max(255),
  description: z.string().optional().default(''),
})

export type createConquestSchemaType = z.infer<typeof createConquestSchema>
