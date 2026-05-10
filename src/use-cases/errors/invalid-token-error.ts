import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class InvalidTokenError extends AppError {
  readonly statusCode = 401
  constructor() {
    super(messages.errors.invalidToken)
  }
}
