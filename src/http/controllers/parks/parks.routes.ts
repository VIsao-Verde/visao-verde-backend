import { verifyUserRole } from '@middlewares/verify-user-role.middleware.js'
import { addParkSchema } from '@schemas/parks/add-park-schema.js'
import { imageParamsSchema } from '@schemas/parks/image-params-schema.js'
import { listParksSchema } from '@schemas/parks/list-parks-schema.js'
import { nearbyParksSchema } from '@schemas/parks/nearby-parks-schema.js'
import { updateSchema } from '@schemas/parks/update-schema.js'
import { idSchema } from '@schemas/utils/public-id-schema.js'
import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { UserRole } from '@/@types/prisma/enums.js'
import { verifyJwt } from '@/http/middlewares/verify-jwt.middleware.js'
import { add } from './add-park.controller.js'
import { addParkImage } from './add-park-image.controller.js'
import { deletePark } from './delete-park.controller.js'
import { deleteParkImage } from './delete-park-image.controller.js'
import { find } from './find-park.controller.js'
import { list } from './list-parks.controller.js'
import { listNearby } from './list-parks-by-proximity.controller.js'
import { update } from './update-park.controller.js'

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function parkRoutes(app: FastifyInstance) {
  app.post(
    '/add',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Parks'],
        summary: 'Create a new park',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        body: doc(addParkSchema),
      },
    },
    add,
  )

  app.get(
    '/list',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Parks'],
        summary: 'List all parks',
        description:
          'Returns parks with review stats, isFavorited, and isVisited for the authenticated user. Use ?favorited=true and/or ?visited=true to filter.',
        security: [{ bearerAuth: [] }],
        querystring: doc(listParksSchema),
      },
    },
    list,
  )

  app.get(
    '/nearby',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Parks'],
        summary: 'Find parks by proximity',
        description:
          'Returns parks within the given radius (km) of the coordinates with isFavorited and isVisited. Use ?favorited=true and/or ?visited=true to filter.',
        security: [{ bearerAuth: [] }],
        querystring: doc(nearbyParksSchema),
      },
    },
    listNearby,
  )

  app.get(
    '/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Parks'],
        summary: 'Get park details',
        description: 'Returns park with trails, images, reviews, and average rating.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    find,
  )

  app.patch(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Parks'],
        summary: 'Update a park',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
        body: doc(updateSchema),
      },
    },
    update,
  )

  app.delete(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Parks'],
        summary: 'Delete a park',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    deletePark,
  )

  app.post(
    '/:id/images',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Parks'],
        summary: 'Upload an image for a park',
        description:
          'Requires ADMIN role. Accepts multipart/form-data with a single image file (max 5MB, jpeg/png/webp).',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
        consumes: ['multipart/form-data'],
      },
    },
    addParkImage,
  )

  app.delete(
    '/:id/images/:imageId',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Parks'],
        summary: 'Delete a park image',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(imageParamsSchema),
      },
    },
    deleteParkImage,
  )
}
