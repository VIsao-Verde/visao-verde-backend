import { env } from '@env/index.js'
import { logger } from '@lib/logger/index.js'
import nodemailer, { type SentMessageInfo } from 'nodemailer'
import type { Attachment } from 'nodemailer/lib/mailer/index.js'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD,
  },
})

interface SendEmailRequest {
  to: string
  subject: string
  message: string
  html: string
  attachments?: Attachment[]
}

export async function sendEmail({
  to,
  subject,
  message,
  html,
  attachments,
}: SendEmailRequest): Promise<SentMessageInfo> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_EMAIL,
      to,
      subject,
      text: message,
      html,
      ...(attachments ? { attachments } : {}),
    })

    logger.info({ sentTo: to, messageId: info.messageId }, 'Message sent!')

    return info
  } catch (error) {
    logger.error({ error }, 'Erro ao enviar e-mail')

    throw error
  }
}
