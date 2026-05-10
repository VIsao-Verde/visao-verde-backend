import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class UserNotFoundForPasswordResetError extends AppError {
  readonly statusCode = 200
  constructor() {
    super(messages.info.passwordResetGeneric)
  }
}
