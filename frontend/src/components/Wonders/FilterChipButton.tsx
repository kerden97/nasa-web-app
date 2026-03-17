import type { ReactNode } from 'react'

interface FilterChipButtonProps {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
  ariaExpanded?: boolean
}

export default function FilterChipButton({
  active = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
  ariaExpanded,
}: FilterChipButtonProps) {
  const base =
    'inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-4 text-sm font-medium leading-none transition-all duration-200'
  const idle =
    'border border-slate-200 bg-white/82 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/58 dark:text-slate-400 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200'
  const activeClass =
    'border border-[rgba(11,61,145,0.18)] bg-[rgba(11,61,145,0.08)] text-[#0B3D91] shadow-[0_0_0_1px_rgba(11,61,145,0.08),0_12px_28px_rgba(15,23,42,0.08)] dark:border-[rgba(140,184,255,0.26)] dark:bg-[rgba(140,184,255,0.12)] dark:text-[#8CB8FF]'

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      className={`${base} ${active ? activeClass : idle} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
