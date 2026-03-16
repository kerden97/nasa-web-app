import { X } from 'lucide-react'

interface ActiveFilterPillProps {
  label: string
  onClear: () => void
}

export default function ActiveFilterPill({ label, onClear }: ActiveFilterPillProps) {
  return (
    <div className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3.5 text-sm font-medium text-cyan-700 shadow-[0_0_0_1px_rgba(34,211,238,0.1),0_12px_28px_rgba(34,211,238,0.12)] dark:border-cyan-400/30 dark:bg-cyan-400/12 dark:text-cyan-300">
      <span className="translate-y-[0.5px]">{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 text-cyan-500 transition-colors hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950 dark:hover:text-cyan-200"
        aria-label="Clear filter"
      >
        <X size={14} />
      </button>
    </div>
  )
}
