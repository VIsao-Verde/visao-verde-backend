import { messages } from '@constants/messages.js'

export class UserNotFoundForPasswordResetError extends Error {
  constructor() {
    super(messages.info.passwordResetGeneric)
  }
}
