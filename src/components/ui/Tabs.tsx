import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-(--border-primary)', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
            'hover:text-(--text-primary)',
            activeTab === tab.id
              ? 'text-brand-600'
              : 'text-(--text-tertiary)'
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'bg-(--surface-tertiary) text-(--text-tertiary)'
              )}
            >
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}

export function useTabState(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return { activeTab, setActiveTab }
}
