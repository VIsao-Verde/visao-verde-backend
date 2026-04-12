import { cpfSchema } from '@schemas/utils/cpf.js'
import { emailSchema } from '@schemas/utils/email.js'
import { passwordSchema } from '@schemas/utils/password.js'
import { usernameSchema } from '@schemas/utils/username.js'
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(4).max(255),
  username: usernameSchema,
  email: emailSchema,
  cpf: cpfSchema,
  password: passwordSchema,
})

export type registerSchemaType = z.infer<typeof registerSchema>
