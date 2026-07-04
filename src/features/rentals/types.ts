import { z } from 'zod'

export type RentalStatus = 'reserved' | 'active' | 'completed' | 'cancelled'
export type RentalItemStatus = 'pending' | 'out' | 'returned' | 'damaged'

export interface RentalReservation {
  id: string
  customer_id: string
  status: RentalStatus
  start_date: string
  end_date: string
  total_amount: number
  deposit_amount: number
  created_by: string
  created_at: string
  updated_at: string
  // relations
  customers?: { first_name: string; last_name: string }
  rental_items?: RentalItem[]
}

export interface RentalItem {
  id: string
  rental_reservation_id: string
  product_id: string
  quantity: number
  unit_price: number
  status: RentalItemStatus
  // relations
  products?: { name: string; sku: string | null }
}

export const createRentalSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  deposit_amount: z.number().min(0),
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })
  ).min(1, 'At least one item is required'),
  created_at: z.string().nullable().optional(),
})

export type CreateRentalPayload = z.infer<typeof createRentalSchema>
