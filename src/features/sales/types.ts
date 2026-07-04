import { z } from 'zod'

export type SalesOrderStatus = 'pending' | 'completed' | 'refunded' | 'cancelled'

export interface SalesOrder {
  id: string
  customer_id: string | null
  status: SalesOrderStatus
  total_amount: number
  discount_amount: number
  tax_amount: number
  payment_method: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // relations
  customers?: { first_name: string; last_name: string } | null
  sales_order_items?: SalesOrderItem[]
}

export interface SalesOrderItem {
  id: string
  sales_order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  // relations
  products?: { name: string; sku: string | null }
}

// Shopping Cart Types
export interface CartItem {
  product_id: string
  name: string
  sku: string | null
  description: string | null
  quantity: number
  unit_price: number
  stock_available: number
}

export const processSaleSchema = z.object({
  customer_id: z.string().nullable().optional(),
  location_id: z.string().min(1, 'Location is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })
  ).min(1, 'Cart cannot be empty'),
  created_at: z.string().nullable().optional(),
})

export type ProcessSalePayload = z.infer<typeof processSaleSchema>
