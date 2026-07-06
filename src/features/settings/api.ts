import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export const STORE_SETTINGS_QUERY_KEY = ['store_settings']

export interface StoreSettings {
  id: string
  store_name: string
  default_location_id: string | null
  tax_rate: number
  currency: string
  contact_email: string | null
  phone: string | null
  address: string | null
}

export function useStoreSettings() {
  return useQuery({
    queryKey: STORE_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data as StoreSettings | null
    },
  })
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      // Get the existing ID if it exists
      const { data: existing } = await supabase.from('store_settings').select('id').limit(1).single()
      
      if (existing) {
        const { error } = await supabase.from('store_settings').update(data).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('store_settings').insert([data])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_QUERY_KEY })
      toast.success('Store settings updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update store settings: ' + error.message)
    },
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async ({ id, first_name, last_name }: { id: string; first_name: string; last_name: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name, last_name })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Profile updated successfully! Refresh to see changes.')
    },
    onError: (error: Error) => {
      toast.error('Failed to update profile: ' + error.message)
    },
  })
}
