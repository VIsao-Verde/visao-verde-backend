import { messages } from '@constants/messages.js'
import { env } from '@env/index.js'
import { logError } from '@lib/logger/helpers.js'
import { logger } from '@lib/logger/index.js'
import * as Sentry from '@sentry/node'
import { AppError } from '@use-cases/errors/app-error.js'
import type { FastifyInstance } from 'fastify'
import z, { ZodError } from 'zod'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message })
    }

    if (error instanceof ZodError) {
      logger.debug(z.treeifyError(error), 'Validation error occurred')
      return reply.status(400).send({
        message: messages.validation.invalidData,
        details: z.treeifyError(error),
      })
    }

    if (error instanceof SyntaxError) {
      logger.error(error, 'JSON inválido recebido')
      return reply.status(400).send({ message: messages.validation.invalidJson })
    }

    if (env.NODE_ENV === 'development') {
      logError(error, {}, 'Unhandled error occurred')
    } else {
      if (env.SENTRY_DSN) Sentry.captureException(error)
      logger.error('Unhandled error occurred')
    }

    return reply.status(500).send({ message: messages.errors.internalServer })
  })
}
