import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProductWithInventory, StockAdjustmentFormData } from './types'
import { toast } from 'sonner'

export const INVENTORY_QUERY_KEY = ['inventory']

export function useInventory() {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async () => {
      // Fetch products and their inventory levels
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          ),
          inventory_levels (
            location_id,
            quantity,
            updated_at
          )
        `)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as ProductWithInventory[]
    },
  })
}

export function useAdjustInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StockAdjustmentFormData) => {
      // Call the secure RPC function to update quantity and insert movement atomically
      const { error } = await supabase.rpc('adjust_inventory', {
        p_product_id: data.product_id,
        p_location_id: data.location_id,
        p_quantity_change: data.quantity_change,
        p_type: data.type,
        p_reference_id: null,
        p_notes: data.notes || null
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success('Stock adjusted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to adjust stock: ' + error.message)
    },
  })
}
