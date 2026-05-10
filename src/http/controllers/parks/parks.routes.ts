import { verifyUserRole } from '@middlewares/verify-user-role.middleware.js'
import type { FastifyInstance } from 'fastify'
import { UserRole } from '@/@types/prisma/enums.js'
import { verifyJwt } from '@/http/middlewares/verify-jwt.middleware.js'
import { add } from './add-park.controller.js'
import { deletePark } from './delete-park.controller.js'
import { find } from './find-park.controller.js'
import { list } from './list-parks.controller.js'
import { listNearby } from './list-parks-by-proximity.controller.js'
import { update } from './update-park.controller.js'

export async function parkRouts(app: FastifyInstance) {
  app.post('/add', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, add)

  app.get('/list', { onRequest: [verifyJwt] }, list)
  app.get('/nearby', { onRequest: [verifyJwt] }, listNearby)
  app.get('/:id', { onRequest: [verifyJwt] }, find)

  app.patch('/:id', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, update)

  app.delete('/:id', { onRequest: [verifyJwt, verifyUserRole([UserRole.ADMIN])] }, deletePark)
}
