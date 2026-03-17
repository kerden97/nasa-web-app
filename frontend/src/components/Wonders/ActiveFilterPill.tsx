import { X } from 'lucide-react'

interface ActiveFilterPillProps {
  label: string
  onClear: () => void
}

export default function ActiveFilterPill({ label, onClear }: ActiveFilterPillProps) {
  return (
    <div className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-[rgba(11,61,145,0.18)] bg-[rgba(11,61,145,0.08)] px-3.5 text-sm font-medium text-[#0B3D91] shadow-[0_0_0_1px_rgba(11,61,145,0.08),0_12px_28px_rgba(15,23,42,0.08)] dark:border-[rgba(140,184,255,0.26)] dark:bg-[rgba(140,184,255,0.12)] dark:text-[#8CB8FF]">
      <span className="translate-y-[0.5px]">{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full p-0.5 text-[#0B3D91] transition-colors hover:bg-[rgba(11,61,145,0.1)] hover:text-[#0F4FB8] dark:text-[#8CB8FF] dark:hover:bg-[rgba(140,184,255,0.12)] dark:hover:text-[#B5CFFF]"
        aria-label="Clear filter"
      >
        <X size={14} />
      </button>
    </div>
  )
}
