import swagger from '@fastify/swagger'
import scalarFastify from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export const registerDocs = fp(async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Visão Verde API',
        version: '1.0.0',
        description: 'Backend API for managing urban green spaces and parks.',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await app.register(scalarFastify, {
    routePrefix: '/docs',
    configuration: { content: () => app.swagger() },
  })
})
