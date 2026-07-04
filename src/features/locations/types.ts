import { z } from 'zod'

export type LocationType = 'store' | 'warehouse' | 'rental_hub'

export interface Location {
  id: string
  name: string
  type: LocationType
  address: string | null
  created_at: string
  updated_at: string
}

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  type: z.enum(['store', 'warehouse', 'rental_hub']),
  address: z.string().nullable().optional(),
})

export type LocationFormData = z.infer<typeof locationSchema>
