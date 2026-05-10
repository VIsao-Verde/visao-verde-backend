import { z } from 'zod'

export const addParkSchema = z.object({
  name: z.string().trim().min(4).max(255),
  description: z.string().optional().default(''),
  city: z.string().trim().min(2).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export type addParkSchemaType = z.infer<typeof addParkSchema>
