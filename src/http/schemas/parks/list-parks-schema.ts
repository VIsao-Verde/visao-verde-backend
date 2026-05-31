import { z } from 'zod'

const PARK_CATEGORIES = ['park', 'plaza', 'garden', 'nature_reserve', 'national_park', 'recreation_ground'] as const
const PARK_SOURCES = ['overpass', 'datario', 'icmbio', 'inea', 'manual'] as const

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
  category: z.enum(PARK_CATEGORIES).optional(),
  source: z.enum(PARK_SOURCES).optional(),
})

export type ListParksSchemaType = z.infer<typeof listParksSchema>
