import type { FastifyInstance } from 'fastify'
import { healthCheck } from './health-check.controller.js'

export async function healthCheckRoutes(app: FastifyInstance) {
  app.get('/', healthCheck)
}
