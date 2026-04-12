import { messages } from '@constants/messages.js'

export class ForbiddenError extends Error {
  constructor() {
    super(messages.errors.forbidden)
  }
}
