import { verifyJwt } from '@middlewares/verify-jwt.middleware.js'
import { createReviewSchema } from '@schemas/reviews/create-review-schema.js'
import { listReviewsSchema } from '@schemas/reviews/list-reviews-schema.js'
import { parkIdParamsSchema } from '@schemas/reviews/park-id-params-schema.js'
import { idSchema } from '@schemas/utils/public-id-schema.js'
import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { createReview } from './create-review.controller.js'
import { deleteReview } from './delete-review.controller.js'
import { listMyReviews } from './list-my-reviews.controller.js'
import { listReviewsByPark } from './list-reviews-by-park.controller.js'

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function reviewsRoutes(app: FastifyInstance) {
  app.post(
    '/parks/:parkId/reviews',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Reviews'],
        summary: 'Create a review for a park',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
        body: doc(createReviewSchema),
      },
    },
    createReview,
  )

  app.get(
    '/parks/:parkId/reviews',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Reviews'],
        summary: 'List reviews for a park',
        security: [{ bearerAuth: [] }],
        params: doc(parkIdParamsSchema),
        querystring: doc(listReviewsSchema),
      },
    },
    listReviewsByPark,
  )

  app.get(
    '/users/me/reviews',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Reviews'],
        summary: "List own reviews",
        security: [{ bearerAuth: [] }],
        querystring: doc(listReviewsSchema),
      },
    },
    listMyReviews,
  )

  app.delete(
    '/reviews/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Reviews'],
        summary: 'Delete a review',
        description: 'Owner or ADMIN.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    deleteReview,
  )
}
