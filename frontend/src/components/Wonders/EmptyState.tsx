import type { ReactNode } from 'react'

interface EmptyStateProps {
  children: ReactNode
}

export default function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/80 py-20 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-400">
      {children}
    </div>
  )
}
