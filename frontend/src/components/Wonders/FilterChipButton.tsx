import type { ReactNode } from 'react'

interface FilterChipButtonProps {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

export default function FilterChipButton({
  active = false,
  children,
  onClick,
  className = '',
  type = 'button',
}: FilterChipButtonProps) {
  const base =
    'inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-4 text-sm font-medium leading-none transition-all duration-200'
  const idle =
    'border border-slate-200 bg-white/82 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/58 dark:text-slate-400 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200'
  const activeClass =
    'border border-cyan-400/20 bg-cyan-400/10 text-cyan-700 shadow-[0_0_0_1px_rgba(34,211,238,0.1),0_12px_28px_rgba(34,211,238,0.14)] dark:border-cyan-400/30 dark:bg-cyan-400/12 dark:text-cyan-300'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${active ? activeClass : idle} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
