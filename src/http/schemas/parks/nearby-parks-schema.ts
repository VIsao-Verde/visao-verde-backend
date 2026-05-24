import { z } from 'zod'

export const nearbyParksSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(500).default(10),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  favorited: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  visited: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export type NearbyParksSchemaType = z.infer<typeof nearbyParksSchema>
