import { passwordSchema } from '@schemas/utils/password.js'
import { z } from 'zod'

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  token: z.string(),
})

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>
