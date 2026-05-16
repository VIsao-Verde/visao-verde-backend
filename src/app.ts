import { env } from '@env/index.js'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import { registerDocs } from '@http/docs.js'
import { registerErrorHandler } from '@http/error-handler.js'
import { appRoutes } from '@http/routes.js'
import { logger, runWithRequestId, runWithUserContext } from '@lib/logger/index.js'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import fastify from 'fastify'
import { v7 as uuidv7 } from 'uuid'
import z from 'zod'

z.config(z.locales.pt())

export const app = fastify({
  logger: false,
})

app.setValidatorCompiler(() => () => true)

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: 'trace',
  })

  Sentry.setupFastifyErrorHandler(app)
}

app.addHook('onRequest', (request, _reply, done) => {
  const requestId = uuidv7()
  const xff = request.headers['x-forwarded-for']
  const clientIp = Array.isArray(xff) ? xff[0] : xff?.split(',')[0].trim() || request.ip

  runWithRequestId(requestId, async () => {
    try {
      const decoded = await request.jwtVerify<{ sub: string }>()
      runWithUserContext(decoded.sub, () => {
        logRequestDetails()
        done()
      })
    } catch {
      logRequestDetails()
      done()
    }

    function logRequestDetails() {
      logger.info(
        {
          method: request.method,
          url: request.url,
          ip: clientIp,
          remotePort: request.socket.remotePort,
          userAgent: request.headers['user-agent'],
        },
        'Incoming request',
      )
    }
  })
})

app.addHook('onResponse', (request, reply, done) => {
  logger.info(
    {
      statusCode: reply.statusCode,
      method: request.method,
      url: request.url,
      requestTime: reply.elapsedTime,
    },
    'Response sent',
  )

  done()
})

app.register(fastifyCors, {
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 3600,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyMultipart)

if (env.NODE_ENV !== 'production') {
  app.register(registerDocs)
}

app.register(appRoutes)

registerErrorHandler(app)
