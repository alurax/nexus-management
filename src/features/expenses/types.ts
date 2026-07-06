import { z } from 'zod'

export interface ExpenseCategory {
  id: string
  name: string
}

export interface Expense {
  id: string
  category_id: string
  amount: number
  date: string
  description: string
  payment_method: string
  receipt_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // relations
  expense_categories?: { name: string }
}

export const expenseCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>

export const expenseSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  receipt_url: z.string().url().optional().or(z.literal('')),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
