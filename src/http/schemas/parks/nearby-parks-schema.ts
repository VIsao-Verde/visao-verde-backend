import { z } from 'zod'

const PARK_CATEGORIES = ['park', 'plaza', 'garden', 'nature_reserve', 'national_park', 'recreation_ground'] as const
const PARK_SOURCES = ['overpass', 'datario', 'icmbio', 'inea', 'manual'] as const

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
  category: z.enum(PARK_CATEGORIES).optional(),
  source: z.enum(PARK_SOURCES).optional(),
})

export type NearbyParksSchemaType = z.infer<typeof nearbyParksSchema>
