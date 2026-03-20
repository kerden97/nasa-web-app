import type { ReactNode } from 'react'

interface SectionHeaderProps {
  kicker: string
  title: string
  description: string
  children?: ReactNode
}

export default function SectionHeader({
  kicker,
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="ui-kicker">{kicker}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {children}
      </div>
    </div>
  )
}
