import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Product, ProductFormData } from './types'
import { toast } from 'sonner'

export const PRODUCTS_QUERY_KEY = ['products']

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Product[]
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Product created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create product: ' + error.message)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Product updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update product: ' + error.message)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
      // We should also invalidate inventory since the product is now gone
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Product deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete product: ' + error.message)
    },
  })
}
