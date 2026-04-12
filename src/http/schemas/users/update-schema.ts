import { cpfSchema } from '@schemas/utils/cpf.js'
import { emailSchema } from '@schemas/utils/email.js'
import { passwordSchema } from '@schemas/utils/password.js'
import { z } from 'zod'
import { usernameSchema } from '../utils/username.js'

export const updateSchema = z.object({
  name: z.string().trim().min(4).optional(),
  email: emailSchema.optional(),
  cpf: cpfSchema.optional(),
  username: usernameSchema.optional(),
  password: passwordSchema.optional(),
})

export type updateSchemaType = z.infer<typeof updateSchema>
