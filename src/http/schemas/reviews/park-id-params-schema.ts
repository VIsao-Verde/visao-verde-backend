import { z } from 'zod'

export const parkIdParamsSchema = z.object({
  parkId: z.string().uuid(),
})

export type ParkIdParamsSchemaType = z.infer<typeof parkIdParamsSchema>
