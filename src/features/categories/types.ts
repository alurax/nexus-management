import { z } from 'zod'

export interface Category {
  id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parent_id: z.string().nullable().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>
