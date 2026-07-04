import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Expense, ExpenseCategory, ExpenseFormData, ExpenseCategoryFormData } from './types'
import { toast } from 'sonner'

export const EXPENSE_CATEGORIES_QUERY_KEY = ['expense_categories']
export const EXPENSES_QUERY_KEY = ['expenses']

// --- Categories API ---

export function useExpenseCategories() {
  return useQuery({
    queryKey: EXPENSE_CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as ExpenseCategory[]
    },
  })
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ExpenseCategoryFormData) => {
      const { error } = await supabase.from('expense_categories').insert([data])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORIES_QUERY_KEY })
      toast.success('Category created')
    },
    onError: (error: Error) => toast.error('Failed: ' + error.message),
  })
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expense_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORIES_QUERY_KEY })
      toast.success('Category deleted')
    },
    onError: (error: Error) => {
      if (error.message.includes('violates foreign key constraint')) {
        toast.error('Cannot delete category because it is in use by existing expenses.')
      } else {
        toast.error('Failed: ' + error.message)
      }
    },
  })
}

// --- Expenses API ---

export function useExpenses() {
  return useQuery({
    queryKey: EXPENSES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_categories (name)
        `)
        .order('date', { ascending: false })
      
      if (error) throw error
      return data as Expense[]
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const payload = {
        ...data,
        receipt_url: data.receipt_url || null,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }
      const { error } = await supabase.from('expenses').insert([payload])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY })
      toast.success('Expense logged successfully')
    },
    onError: (error: Error) => toast.error('Failed: ' + error.message),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY })
      toast.success('Expense deleted')
    },
    onError: (error: Error) => toast.error('Failed: ' + error.message),
  })
}
