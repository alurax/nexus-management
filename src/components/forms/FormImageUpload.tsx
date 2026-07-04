import { useState, useRef, type ChangeEvent } from 'react'
import { cn } from '@/utils/cn'
import { Upload, X } from 'lucide-react'

interface FormImageUploadProps {
  label?: string
  error?: string
  required?: boolean
  value?: string
  onChange?: (file: File | null) => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FormImageUpload({
  label,
  error,
  required,
  value,
  onChange,
  accept = 'image/*',
  maxSizeMB = 5,
  className,
}: FormImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null)
      onChange?.(null)
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    onChange?.(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0] || null
    handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-(--text-primary)">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}

      {preview ? (
        <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-(--border-primary)">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 rounded-full bg-danger-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6',
            'border-2 border-dashed rounded-xl cursor-pointer',
            'transition-colors duration-150',
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
              : 'border-(--border-primary) hover:border-(--text-tertiary) hover:bg-(--interactive-hover)',
          )}
        >
          <div className="p-2.5 rounded-xl bg-(--surface-tertiary) text-(--text-tertiary)">
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-(--text-secondary)">
              Click to upload or drag and drop
            </p>
            <p className="text-[10px] text-(--text-tertiary) mt-0.5">
              PNG, JPG or WebP (max {maxSizeMB}MB)
            </p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  )
}
