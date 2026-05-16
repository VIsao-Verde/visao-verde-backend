import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class ImageNotFoundError extends AppError {
  readonly statusCode = 404
  constructor() {
    super(messages.validation.imageNotFound)
  }
}
