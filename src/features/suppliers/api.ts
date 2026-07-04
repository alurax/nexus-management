import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Supplier, SupplierFormData } from './types'
import { toast } from 'sonner'

export const SUPPLIERS_QUERY_KEY = ['suppliers']

export function useSuppliers() {
  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Supplier[]
    },
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SupplierFormData) => {
      // Clean up empty strings to null for DB constraints
      const payload = {
        ...data,
        email: data.email || null,
      }
      const { error } = await supabase.from('suppliers').insert([payload])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
      toast.success('Supplier created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create supplier: ' + error.message)
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierFormData }) => {
      const payload = {
        ...data,
        email: data.email || null,
      }
      const { error } = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
      toast.success('Supplier updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update supplier: ' + error.message)
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
      toast.success('Supplier deleted successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('violates foreign key constraint')) {
        toast.error('Cannot delete supplier because they have active purchase orders.')
      } else {
        toast.error('Failed to delete supplier: ' + error.message)
      }
    },
  })
}
