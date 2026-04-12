import { messages } from '@constants/messages.js'

export class UserAlreadyExistsError extends Error {
  constructor() {
    super(messages.validation.userAlreadyExists)
  }
}
