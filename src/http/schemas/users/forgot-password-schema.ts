import { z } from 'zod'
import { emailSchema } from '../utils/email.js'
import { usernameSchema } from '../utils/username.js'

export const forgotPasswordSchema = z.object({
  login: z.union([usernameSchema, emailSchema]),
})

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>
