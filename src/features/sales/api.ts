import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SalesOrder, ProcessSalePayload } from './types'
import { toast } from 'sonner'
import { INVENTORY_QUERY_KEY } from '@/features/inventory/api'
import { DASHBOARD_METRICS_QUERY_KEY } from '@/features/dashboard/api'

export const SALES_QUERY_KEY = ['sales']

export function useSalesOrders() {
  return useQuery({
    queryKey: SALES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          ),
          sales_order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              sku
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as SalesOrder[]
    },
  })
}

export function useProcessSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProcessSalePayload) => {
      const { error } = await supabase.rpc('process_sale', {
        p_customer_id: data.customer_id || null,
        p_location_id: data.location_id,
        p_payment_method: data.payment_method,
        p_discount: data.discount,
        p_tax: data.tax,
        p_items: data.items,
        p_created_at: data.created_at || null
      })

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate sales history and inventory since stock was deducted
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_METRICS_QUERY_KEY })
      toast.success('Sale completed successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to process sale: ' + error.message)
    },
  })
}

export function useReturnSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ order_id, location_id, notes }: { order_id: string, location_id: string, notes: string }) => {
      const { error } = await supabase.rpc('process_sale_return', {
        p_order_id: order_id,
        p_location_id: location_id,
        p_notes: notes
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_METRICS_QUERY_KEY })
      toast.success('Sale returned and items restocked')
    },
    onError: (error: Error) => {
      toast.error('Failed to return sale: ' + error.message)
    }
  })
}

export function useUpdateSaleNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ order_id, notes }: { order_id: string, notes: string }) => {
      const { error } = await supabase.rpc('update_sale_notes', {
        p_order_id: order_id,
        p_notes: notes
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEY })
      toast.success('Remarks updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update remarks: ' + error.message)
    }
  })
}
