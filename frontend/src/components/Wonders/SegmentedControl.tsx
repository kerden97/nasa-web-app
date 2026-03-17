import type { ReactNode } from 'react'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white/82 p-1 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-900/72 dark:shadow-[0_14px_32px_rgba(2,6,23,0.18)] ${className}`.trim()}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex h-8 min-w-22 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-medium leading-none transition-all ${
              active
                ? 'bg-[rgba(11,61,145,0.1)] text-[#0B3D91] shadow-[0_0_0_1px_rgba(11,61,145,0.12),0_10px_24px_rgba(15,23,42,0.08)] dark:bg-[rgba(140,184,255,0.12)] dark:text-[#8CB8FF]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
            }`}
          >
            {option.icon ? (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {option.icon}
              </span>
            ) : null}
            <span className="translate-y-[0.5px]">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
