import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class ReviewNotFoundError extends AppError {
  readonly statusCode = 404
  constructor() {
    super(messages.validation.reviewNotFound)
  }
}
