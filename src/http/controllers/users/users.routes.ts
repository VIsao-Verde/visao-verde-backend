import { verifyJwt } from '@middlewares/verify-jwt.middleware.js'
import { verifyUserRole } from '@middlewares/verify-user-role.middleware.js'
import type { FastifyInstance } from 'fastify'
import { UserRole } from '@/@types/prisma/enums.js'
import { authenticateUser } from './authenticate-user.controller.js'
import { deleteUser, deleteUserById } from './delete-user.controller.js'
import { forgotPassword } from './forgot-password.controller.js'
import { getUserById, getUserProfile } from './get-user-profile.controller.js'
import { listUsers } from './list-users.controller.js'
import { register, registerAdmin } from './register-user.controller.js'
import { resetPassword } from './reset-password.controller.js'
import { updateUser, updateUserById } from './update-user.controller.js'

export async function usersRoutes(app: FastifyInstance) {
  // Register routes:
  app.post('/register/admin', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, registerAdmin)
  app.post('/register', register)

  // Authentication routes:
  app.post('/sessions', authenticateUser)
  app.post('/forgot-password', forgotPassword)
  app.patch('/reset-password', resetPassword)

  // User routes:
  app.patch('/me', { onRequest: [verifyJwt] }, updateUser)
  app.get('/me', { onRequest: [verifyJwt] }, getUserProfile)
  app.delete('/me', { onRequest: [verifyJwt] }, deleteUser)

  // Users administration routes:
  app.patch('/:id', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, updateUserById)
  app.delete('/:id', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, deleteUserById)
  app.get('/:id', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, getUserById)
  app.get('/', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, listUsers)
}
