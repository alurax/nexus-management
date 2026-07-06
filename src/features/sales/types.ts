export type SalesOrderStatus = 'pending' | 'completed' | 'refunded' | 'cancelled' | 'care_of'

export type PaymentMethod = 'cash' | 'gcash' | 'ewallet'

export interface SalesOrder {
  id: string
  customer_id: string | null
  status: SalesOrderStatus
  total_amount: number
  discount_amount: number
  tax_amount: number
  payment_method: PaymentMethod | string | null
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

export interface ProcessSalePayload {
  customer_id?: string | null
  location_id: string
  payment_method: string
  discount: number
  tax: number
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  created_at?: string
  status?: string
}
