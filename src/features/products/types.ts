import { z } from 'zod'
import type { Category } from '@/features/categories/types'

export type ProductType = 'retail' | 'rental' | 'service'

export interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  description: string | null
  category_id: string | null
  type: ProductType
  base_price: number
  cost_price: number
  created_at: string
  updated_at: string
  
  // Joined relation (optional based on query)
  categories?: Category
}

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  type: z.enum(['retail', 'rental', 'service']),
  base_price: z.coerce.number().min(0, 'Price must be non-negative'),
  cost_price: z.coerce.number().min(0, 'Cost must be non-negative'),
})

export type ProductFormData = z.infer<typeof productSchema>
