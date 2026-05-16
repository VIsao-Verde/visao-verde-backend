import { messages } from '@constants/messages.js'
import { AppError } from './app-error.js'

export class ImageUploadError extends AppError {
  readonly statusCode = 500
  constructor() {
    super(messages.validation.imageUploadFailed)
  }
}
