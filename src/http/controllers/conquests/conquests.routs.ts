import { UserRole } from '@/@types/prisma/enums.js'
import { verifyJwt } from "@/http/middlewares/verify-jwt.middleware.js";
import { verifyUserRole } from "@/http/middlewares/verify-user-role.middleware.js";
import { createConquestSchema } from '@/http/schemas/conquests/create-conquest-schema.js';
import { FastifyInstance } from "fastify";
import { create } from './create-conquest.controller.js';
import z from 'zod';
import { idSchema } from '@/http/schemas/utils/public-id-schema.js';
import { find } from './find-conquest-controller.js';
import { list } from './list-conquests.controller.js';
import { listByUser } from './list-conquests-by-user-id.controller.js';
import { update } from './update-conquest.js';
import { updateSchema } from '@/http/schemas/conquests/update-schema.js';
import { deleteConquest } from './delete-conquest.controller.js';

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function conquestRouts(app: FastifyInstance) {
  app.post(
    '/add',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Conquests'],
        summary: 'Create a new conquest',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        body: doc(createConquestSchema),
      },
    },
    create,
  )

  app.get(
    '/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Conquests'],
        summary: 'Get conquest details',
        description: 'Returns conquest',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    find,
  )

  app.get(
    '/list',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Conquests'],
        summary: 'List all conquests',
        security: [{ bearerAuth: [] }],
      },
    },
    list,
  )

  app.get(
    '/list/:userId',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Conquests'],
        summary: 'List conquests from user',
        security: [{ bearerAuth: [] }],
      },
    },
    listByUser,
  )

  app.patch(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Conquests'],
        summary: 'Update a conquest',
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
        tags: ['Conquests'],
        summary: 'Delete a conquest',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    deleteConquest,
  )

}