import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class NotReviewOwnerError extends AppError {
  readonly statusCode = 403
  constructor() {
    super(messages.validation.notReviewOwner)
  }
}
