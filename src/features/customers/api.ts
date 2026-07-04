import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer, CustomerFormData } from './types'
import { toast } from 'sonner'

export const CUSTOMERS_QUERY_KEY = ['customers']

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_name')
      
      if (error) throw error
      return data as Customer[]
    },
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      }
      const { error } = await supabase.from('customers').insert([payload])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
      toast.success('Customer created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create customer: ' + error.message)
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormData }) => {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      }
      const { error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
      toast.success('Customer updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update customer: ' + error.message)
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY })
      toast.success('Customer deleted successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('violates foreign key constraint')) {
        toast.error('Cannot delete customer with existing sales or reservations.')
      } else {
        toast.error('Failed to delete customer: ' + error.message)
      }
    },
  })
}
