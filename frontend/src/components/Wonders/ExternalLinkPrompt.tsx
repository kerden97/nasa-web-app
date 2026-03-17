interface ExternalLinkPromptProps {
  hostname: string
  label: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ExternalLinkPrompt({
  hostname,
  label,
  onCancel,
  onConfirm,
}: ExternalLinkPromptProps) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        event.stopPropagation()
        onCancel()
      }}
    >
      <div
        className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="ui-kicker">Leaving Home &amp; Beyond</p>
        <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
          Open {label} media?
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          You are about to leave this site and open the media on{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{hostname}</span>.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cosmic-btn-ghost rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cosmic-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Continue to {label}
          </button>
        </div>
      </div>
    </div>
  )
}
