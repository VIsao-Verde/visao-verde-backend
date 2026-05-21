import { UserRole } from '@/@types/prisma/enums.js'
import { verifyJwt } from "@/http/middlewares/verify-jwt.middleware.js";
import { verifyUserRole } from "@/http/middlewares/verify-user-role.middleware.js";
import { createConquestSchema } from '@/http/schemas/conquests/create-conquest-schema.js';
import { FastifyInstance } from "fastify";
import { create } from './create-conquest-controller.js';

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
}