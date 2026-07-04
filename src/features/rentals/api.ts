import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RentalReservation, CreateRentalPayload, RentalStatus } from './types'
import { toast } from 'sonner'
import { INVENTORY_QUERY_KEY } from '@/features/inventory/api'

export const RENTALS_QUERY_KEY = ['rentals']

export function useRentals() {
  return useQuery({
    queryKey: RENTALS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_reservations')
        .select(`
          *,
          customers (
            first_name,
            last_name
          ),
          rental_items (
            id,
            quantity,
            unit_price,
            status,
            products (
              name,
              sku
            )
          )
        `)
        .order('start_date', { ascending: true })
      
      if (error) throw error
      return data as RentalReservation[]
    },
  })
}

export function useCreateRental() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRentalPayload) => {
      // Calculate total amount
      const total_amount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

      // 1. Create reservation
      const { data: reservation, error: resError } = await supabase
        .from('rental_reservations')
        .insert([{
          customer_id: data.customer_id,
          start_date: data.start_date,
          end_date: data.end_date,
          deposit_amount: data.deposit_amount,
          total_amount: total_amount,
          status: 'reserved',
          ...(data.created_at ? { created_at: data.created_at, updated_at: data.created_at } : {})
        }])
        .select('id')
        .single()

      if (resError) throw resError

      // 2. Create items
      const itemsPayload = data.items.map(item => ({
        rental_reservation_id: reservation.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        status: 'pending',
        ...(data.created_at ? { created_at: data.created_at, updated_at: data.created_at } : {})
      }))

      const { error: itemsError } = await supabase
        .from('rental_items')
        .insert(itemsPayload)

      if (itemsError) throw itemsError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RENTALS_QUERY_KEY })
      toast.success('Reservation created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create reservation: ' + error.message)
    },
  })
}

export function useUpdateRentalStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, location_id, created_at }: { id: string; status: RentalStatus; location_id: string; created_at?: string }) => {
      // Call the Postgres RPC we created to handle atomic status updates and inventory!
      const { error } = await supabase.rpc('update_rental_status', {
        p_reservation_id: id,
        p_new_status: status,
        p_location_id: location_id,
        p_created_at: created_at || null
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RENTALS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY }) // Invalidate inventory because items might have moved!
      toast.success('Reservation status updated')
    },
    onError: (error: Error) => {
      toast.error('Failed to update status: ' + error.message)
    },
  })
}
