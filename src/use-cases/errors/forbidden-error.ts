import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class ForbiddenError extends AppError {
  readonly statusCode = 403
  constructor() {
    super(messages.errors.forbidden)
  }
}
