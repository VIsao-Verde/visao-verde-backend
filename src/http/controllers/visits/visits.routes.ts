import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { verifyJwt } from '@/http/middlewares/verify-jwt.middleware.js'
import { parkIdParamsSchema } from '@/http/schemas/reviews/park-id-params-schema.js'
import { unvisitPark } from './unvisit-park.controller.js'
import { visitPark } from './visit-park.controller.js'

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function visitsRoutes(app: FastifyInstance) {
  app.post(
    '/parks/:parkId/visits',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Visits'],
        summary: 'Mark a park as visited',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
      },
    },
    visitPark,
  )

  app.delete(
    '/parks/:parkId/visits',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Visits'],
        summary: 'Unmark a park as visited',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
      },
    },
    unvisitPark,
  )
}
