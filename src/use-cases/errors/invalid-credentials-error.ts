import { messages } from '@constants/messages.js'

export class InvalidCredentialsError extends Error {
  constructor() {
    super(messages.errors.invalidCredentials)
  }
}
