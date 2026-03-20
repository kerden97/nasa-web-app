import type { ReactNode } from 'react'

interface InfoBoxProps {
  label: string
  children: ReactNode
  className?: string
  contentClassName?: string
  labelClassName?: string
  paddingClassName?: string
}

export default function InfoBox({
  label,
  children,
  className = '',
  contentClassName = 'mt-2',
  labelClassName = '',
  paddingClassName = 'p-3',
}: InfoBoxProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50/85 dark:border-slate-800 dark:bg-slate-950/60 ${paddingClassName} ${className}`.trim()}
    >
      <p
        className={`text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 ${labelClassName}`.trim()}
      >
        {label}
      </p>
      <div className={contentClassName}>{children}</div>
    </div>
  )
}
