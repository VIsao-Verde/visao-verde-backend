import { env } from '@env/index.js'
import { logError } from '@lib/logger/helpers.js'
import { logger } from '@lib/logger/index.js'
import { app } from './app.js'

app
  .listen({ host: '0.0.0.0', port: env.PORT })
  .then(() => {
    logger.info(`Server started successfully! Listening on: ${env.PORT}`)
  })
  .catch((err) => {
    logError(err, {}, 'Failed to start server')
    process.exit(1)
  })
