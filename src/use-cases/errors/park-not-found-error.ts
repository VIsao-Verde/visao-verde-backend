import { messages } from '@constants/messages.js'

export class ParkNotFoundError extends Error {
  constructor() {
    super(messages.validation.parkNotFound)
  }
}
