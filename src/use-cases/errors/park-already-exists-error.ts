import { messages } from '@constants/messages.js'

export class ParkAlreadyExistsError extends Error {
  constructor() {
    super(messages.validation.parkAlreadyExists)
  }
}
