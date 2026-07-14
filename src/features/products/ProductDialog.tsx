import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { FormCurrencyInput } from '@/components/forms/FormCurrencyInput'
import { productSchema, type Product, type ProductFormData } from './types'
import { useCreateProduct, useUpdateProduct } from './api'
import { useCategories } from '@/features/categories/api'

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  productToEdit?: Product | null
}

export function ProductDialog({ open, onClose, productToEdit }: ProductDialogProps) {
  const isEditing = !!productToEdit
  
  const { data: categories } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      category_id: '',
      type: 'retail',
      base_price: 0,
      cost_price: 0,
    },
  })

  // Reset form when opened with new data
  useEffect(() => {
    if (open) {
      reset({
        name: productToEdit?.name || '',
        sku: productToEdit?.sku || '',
        barcode: productToEdit?.barcode || '',
        description: productToEdit?.description || '',
        category_id: productToEdit?.category_id || '',
        type: productToEdit?.type || 'retail',
        base_price: productToEdit?.base_price || 0,
        cost_price: productToEdit?.cost_price || 0,
      })
    }
  }, [open, productToEdit, reset])

  const [selectedMargin, setSelectedMargin] = useState<number | null>(null)
  const currentCost = watch('cost_price') || 0

  const margins = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 75]

  const handleMarginClick = (margin: number) => {
    setSelectedMargin(margin)
    const marginDecimal = margin / 100
    // Strict Gross Margin Formula: Cost / (1 - Margin%)
    // (If margin >= 100%, math breaks down, so we cap it safely)
    const newPrice = marginDecimal >= 1 ? 0 : currentCost / (1 - marginDecimal)
    setValue('base_price', Number(newPrice.toFixed(2)), { shouldValidate: true })
  }

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      ...data,
      sku: data.sku || null,
      barcode: data.barcode || null,
      description: data.description || null,
      category_id: data.category_id || null,
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: productToEdit.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation toast
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-(--text-primary)">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </span>
          <span className="text-sm font-normal text-(--text-tertiary) mt-0.5">
            {isEditing ? 'Make changes to this product.' : 'Create a new product in the catalog.'}
          </span>
        </div>
      </ModalHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
        <ModalContent className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" error={errors.name?.message} required>
            <Input
              {...register('name')}
              placeholder="e.g. Penn Battle III Spinning Reel"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Category" error={errors.category_id?.message}>
            <select
              {...register('category_id')}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary)"
            >
              <option value="">No Category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Product Type" error={errors.type?.message} required>
            <select
              {...register('type')}
              disabled={isSubmitting}
              className="w-full h-10 px-3 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary)"
            >
              <option value="retail">Retail</option>
              <option value="rental">Rental</option>
              <option value="service">Service</option>
            </select>
          </FormField>

          <FormField label="SKU" error={errors.sku?.message}>
            <Input
              {...register('sku')}
              placeholder="Internal Code"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Barcode" error={errors.barcode?.message}>
            <Input
              {...register('barcode')}
              placeholder="UPC / EAN"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCurrencyInput
            {...register('cost_price', { 
              valueAsNumber: true,
              onChange: () => setSelectedMargin(null)
            })}
            label="Cost Price"
            disabled={isSubmitting}
            error={errors.cost_price?.message}
          />
          <div className="space-y-2">
            <FormCurrencyInput
              {...register('base_price', { 
                valueAsNumber: true,
                onChange: () => setSelectedMargin(null)
              })}
              label="Retail Price"
              disabled={isSubmitting}
              error={errors.base_price?.message}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {margins.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMarginClick(m)}
                  disabled={currentCost <= 0}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-colors ${
                    selectedMargin === m 
                      ? 'bg-(--brand-primary) text-white border-(--brand-primary)' 
                      : 'bg-(--surface-primary) text-(--text-secondary) border-(--border-primary) hover:bg-(--surface-secondary) disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  +{m}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <FormField label="Description" error={errors.description?.message}>
          <textarea
            {...register('description')}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg bg-(--surface-primary) border border-(--border-primary) text-(--text-primary) focus:outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-focus) transition-shadow disabled:opacity-50 disabled:bg-(--surface-secondary) resize-none"
            placeholder="Product details and specifications..."
          />
        </FormField>

        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
