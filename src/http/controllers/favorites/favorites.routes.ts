import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { verifyJwt } from '@/http/middlewares/verify-jwt.middleware.js'
import { listFavoritesSchema } from '@/http/schemas/favorites/list-favorites-schema.js'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { favoritePark } from './favorite-park.controller.js'
import { listFavorites } from './list-favorites.controller.js'
import { unfavoritePark } from './unfavorite-park.controller.js'

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function favoritesRoutes(app: FastifyInstance) {
  app.get(
    '/me/favorites',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Favorites'],
        summary: 'List authenticated user favorite parks',
        security: [{ bearerAuth: [] }],
        querystring: doc(listFavoritesSchema),
      },
    },
    listFavorites,
  )

  app.post(
    '/parks/:parkId/favorites',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Favorites'],
        summary: 'Favorite a park',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
      },
    },
    favoritePark,
  )

  app.delete(
    '/parks/:parkId/favorites',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Favorites'],
        summary: 'Unfavorite a park',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
      },
    },
    unfavoritePark,
  )
}
