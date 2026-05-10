import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class ParkNotFoundError extends AppError {
  readonly statusCode = 404
  constructor() {
    super(messages.validation.parkNotFound)
  }
}
