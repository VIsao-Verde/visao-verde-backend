import { SendEmailUseCase } from '@use-cases/messaging/send-email.js'

export function makeSendEmailUseCase() {
  return new SendEmailUseCase()
}
