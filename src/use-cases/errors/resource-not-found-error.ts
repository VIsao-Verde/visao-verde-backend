import { messages } from '@constants/messages.js'

export class ResourceNotFoundError extends Error {
  constructor() {
    super(messages.errors.resourceNotFound)
  }
}
