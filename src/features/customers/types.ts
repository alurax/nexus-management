import { z } from 'zod'

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
