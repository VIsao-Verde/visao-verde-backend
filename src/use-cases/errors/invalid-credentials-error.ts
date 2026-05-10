import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class InvalidCredentialsError extends AppError {
  readonly statusCode = 400
  constructor() {
    super(messages.errors.invalidCredentials)
  }
}
