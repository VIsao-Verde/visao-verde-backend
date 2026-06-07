import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class AlreadyReportedReviewError extends AppError {
  readonly statusCode = 409
  constructor() {
    super(messages.validation.alreadyReportedReview)
  }
}
