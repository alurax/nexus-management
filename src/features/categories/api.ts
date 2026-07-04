import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Category, CategoryFormData } from './types'
import { toast } from 'sonner'

export const CATEGORIES_QUERY_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase.from('categories').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      toast.success('Category created successfully')
    },
    onError: (error: any) => {
      if (error.code === '23505') { // Postgres unique_violation code
        toast.error('A category with this name already exists.')
      } else {
        toast.error('Failed to create category: ' + error.message)
      }
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      toast.success('Category updated successfully')
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('A category with this name already exists.')
      } else {
        toast.error('Failed to update category: ' + error.message)
      }
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      toast.success('Category deleted successfully')
    },
    onError: (error: Error) => {
      // Handle foreign key constraint error (cannot delete if products exist)
      if (error.message.includes('violates foreign key constraint')) {
        toast.error('Cannot delete category because it is in use by products.')
      } else {
        toast.error('Failed to delete category: ' + error.message)
      }
    },
  })
}
