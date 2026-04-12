import { z } from 'zod'
import { emailSchema } from '../utils/email.js'
import { usernameSchema } from '../utils/username.js'

export const authenticateSchema = z.object({
  login: z.union([usernameSchema, emailSchema]),
  password: z.string().trim().min(4),
})

export type AuthenticateSchemaType = z.infer<typeof authenticateSchema>
