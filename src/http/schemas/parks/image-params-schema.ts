import z from 'zod'

export const imageParamsSchema = z.object({
  id: z.uuid(),
  imageId: z.uuid(),
})
