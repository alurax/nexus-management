import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-(--text-tertiary)">
        Showing{' '}
        <span className="font-medium text-(--text-secondary)">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
        </span>
        {' '}to{' '}
        <span className="font-medium text-(--text-secondary)">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}
        </span>
        {' '}of{' '}
        <span className="font-medium text-(--text-secondary)">
          {table.getFilteredRowModel().rows.length}
        </span>{' '}
        results
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          icon={<ChevronsLeft className="h-4 w-4" />}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          icon={<ChevronLeft className="h-4 w-4" />}
        />

        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const pageIndex = table.getState().pagination.pageIndex
            const totalPages = table.getPageCount()
            let startPage = Math.max(0, pageIndex - 2)
            const endPage = Math.min(totalPages, startPage + 5)
            startPage = Math.max(0, endPage - 5)
            const page = startPage + i

            if (page >= totalPages) return null

            return (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  page === pageIndex
                    ? 'bg-brand-600 text-white'
                    : 'text-(--text-secondary) hover:bg-(--interactive-hover)'
                }`}
              >
                {page + 1}
              </button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          icon={<ChevronRight className="h-4 w-4" />}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          icon={<ChevronsRight className="h-4 w-4" />}
        />
      </div>
    </div>
  )
}
