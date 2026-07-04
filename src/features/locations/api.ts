import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Location, LocationFormData } from './types'
import { toast } from 'sonner'

export const LOCATIONS_QUERY_KEY = ['locations']

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Location[]
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LocationFormData) => {
      const { error } = await supabase.from('locations').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      toast.success('Location created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create location: ' + error.message)
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationFormData }) => {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      toast.success('Location updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update location: ' + error.message)
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('locations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      toast.success('Location deleted successfully')
    },
    onError: (error: Error) => {
      if (error.message.includes('violates foreign key constraint')) {
        toast.error('Cannot delete location because it contains inventory stock or transaction history.')
      } else {
        toast.error('Failed to delete location: ' + error.message)
      }
    },
  })
}
