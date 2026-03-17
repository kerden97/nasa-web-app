import { AlertTriangle } from 'lucide-react'

interface InlineErrorNoticeProps {
  message: string
  title?: string
  className?: string
}

export default function InlineErrorNotice({
  message,
  title = 'Unable to load this section',
  className = '',
}: InlineErrorNoticeProps) {
  return (
    <div
      role="alert"
      className={`rounded-[24px] border border-rose-200/80 bg-rose-50/95 px-5 py-4 text-rose-950 shadow-[0_16px_36px_rgba(127,29,29,0.12)] backdrop-blur-sm dark:border-rose-500/25 dark:bg-rose-950/45 dark:text-rose-100 dark:shadow-[0_18px_42px_rgba(69,10,10,0.28)] ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-rose-200/80 bg-white/65 p-2 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          <AlertTriangle size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.04em] text-rose-900 dark:text-rose-100">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-rose-800/85 dark:text-rose-100/80">{message}</p>
        </div>
      </div>
    </div>
  )
}
