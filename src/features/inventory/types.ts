import { z } from 'zod'
import type { Product } from '@/features/products/types'

export interface InventoryLevel {
  product_id: string
  location_id: string
  quantity: number
  updated_at: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  from_location_id: string | null
  to_location_id: string | null
  quantity: number
  type: 'receive' | 'sale' | 'transfer' | 'adjustment' | 'return'
  reference_id: string | null
  notes: string | null
  created_by: string
  created_at: string
}

// For the UI, we often want to display products grouped with their locations
export interface ProductWithInventory extends Product {
  inventory_levels: InventoryLevel[]
}

// Schema for manual stock adjustments
export const stockAdjustmentSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  location_id: z.string().min(1, 'Location is required'),
  type: z.enum(['receive', 'adjustment', 'return', 'transfer']),
  quantity_change: z.coerce.number().refine(val => val !== 0, 'Quantity cannot be zero'),
  notes: z.string().nullable().optional(),
})

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>
