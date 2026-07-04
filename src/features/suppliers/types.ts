import { z } from 'zod'

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export const supplierSchema = z.object({
  name: z.string().min(1, 'Company Name is required'),
  contact_name: z.string().nullable().optional(),
  email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
})

export type SupplierFormData = z.infer<typeof supplierSchema>
