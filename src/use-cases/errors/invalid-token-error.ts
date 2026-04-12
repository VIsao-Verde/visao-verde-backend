import { messages } from '@constants/messages.js'

export class InvalidTokenError extends Error {
  constructor() {
    super(messages.errors.invalidToken)
  }
}
