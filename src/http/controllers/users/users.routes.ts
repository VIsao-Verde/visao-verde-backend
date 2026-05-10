import { UserRole } from '@/@types/prisma/enums.js'
import { verifyJwt } from '@middlewares/verify-jwt.middleware.js'
import { verifyUserRole } from '@middlewares/verify-user-role.middleware.js'
import { authenticateSchema } from '@schemas/users/authenticate-schema.js'
import { forgotPasswordSchema } from '@schemas/users/forgot-password-schema.js'
import { registerSchema } from '@schemas/users/register-schema.js'
import { resetPasswordSchema } from '@schemas/users/reset-password-schema.js'
import { updateSchema } from '@schemas/users/update-schema.js'
import { idSchema } from '@schemas/utils/public-id-schema.js'
import type { FastifyInstance } from 'fastify'
import z from 'zod'
import { authenticateUser } from './authenticate-user.controller.js'
import { deleteUser, deleteUserById } from './delete-user.controller.js'
import { forgotPassword } from './forgot-password.controller.js'
import { getUserById, getUserProfile } from './get-user-profile.controller.js'
import { listUsers } from './list-users.controller.js'
import { register, registerAdmin } from './register-user.controller.js'
import { resetPassword } from './reset-password.controller.js'
import { updateUser, updateUserById } from './update-user.controller.js'

const doc = (s: z.ZodType) => z.toJSONSchema(s, { unrepresentable: 'any' })

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/register/admin',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Users'],
        summary: 'Register an admin user',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        body: doc(registerSchema),
      },
    },
    registerAdmin,
  )

  app.post(
    '/register',
    {
      schema: {
        tags: ['Users'],
        summary: 'Register a new user',
        body: doc(registerSchema),
      },
    },
    register,
  )

  app.post(
    '/sessions',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate user',
        description: 'Returns a JWT token valid for 1 day.',
        body: doc(authenticateSchema),
      },
    },
    authenticateUser,
  )

  app.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Request password reset',
        description: 'Sends a reset link to the email if found. Always returns 200 to avoid user enumeration.',
        body: doc(forgotPasswordSchema),
      },
    },
    forgotPassword,
  )

  app.patch(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Reset password',
        description: 'Resets the password using a token received by email.',
        body: doc(resetPasswordSchema),
      },
    },
    resetPassword,
  )

  app.patch(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Update own profile',
        security: [{ bearerAuth: [] }],
        body: doc(updateSchema),
      },
    },
    updateUser,
  )

  app.get(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Get own profile',
        security: [{ bearerAuth: [] }],
      },
    },
    getUserProfile,
  )

  app.delete(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Delete own account',
        security: [{ bearerAuth: [] }],
      },
    },
    deleteUser,
  )

  app.patch(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Users'],
        summary: 'Update user by ID',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
        body: doc(updateSchema),
      },
    },
    updateUserById,
  )

  app.delete(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    deleteUserById,
  )

  app.get(
    '/:id',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
        params: doc(idSchema),
      },
    },
    getUserById,
  )

  app.get(
    '/',
    {
      onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])],
      schema: {
        tags: ['Users'],
        summary: 'List all users',
        description: 'Requires ADMIN role.',
        security: [{ bearerAuth: [] }],
      },
    },
    listUsers,
  )
}
