import { healthCheckRoutes } from '@controllers/health-check/health-check.routes.js'
import { reviewsRoutes } from '@controllers/reviews/reviews.routes.js'
import { usersRoutes } from '@controllers/users/users.routes.js'
import type { FastifyInstance } from 'fastify'
import { parkRouts } from './controllers/parks/parks.routes.js'
import { conquestRouts } from './controllers/conquests/conquests.routs.js'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes, { prefix: '/users' })
  app.register(healthCheckRoutes, { prefix: '/health' })
  app.register(parkRouts, { prefix: '/parks' })
  app.register(reviewsRoutes)
  app.register(conquestRouts, { prefix: '/conquests' })
}
