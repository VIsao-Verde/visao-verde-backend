import { healthCheckRoutes } from '@controllers/health-check/health-check.routes.js'
import { reviewsRoutes } from '@controllers/reviews/reviews.routes.js'
import { usersRoutes } from '@controllers/users/users.routes.js'
import type { FastifyInstance } from 'fastify'
import { conquestRoutes } from './controllers/conquests/conquests.routes.js'
import { parkRoutes } from './controllers/parks/parks.routes.js'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/users' })
  app.register(healthCheckRoutes, { prefix: '/health' })
  app.register(parkRoutes, { prefix: '/parks' })
  app.register(reviewsRoutes)
  app.register(conquestRoutes, { prefix: '/conquests' })
}
