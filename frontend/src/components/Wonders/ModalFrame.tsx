import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useModalBodyLock } from './useModalBodyLock'

interface ModalFrameProps {
  children: ReactNode
  onClose: () => void
  closeLabel?: string
  maxWidthClass?: string
}

export default function ModalFrame({
  children,
  onClose,
  closeLabel = 'Close modal',
  maxWidthClass = 'max-w-6xl',
}: ModalFrameProps) {
  useModalBodyLock(true)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center px-4 pb-4 pt-[89px]">
          <div
            className={`relative flex max-h-full w-full ${maxWidthClass} flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_36px_120px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="absolute right-5 top-5 z-30 flex shrink-0 rounded-full border border-slate-300 bg-white/90 p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900"
            >
              <X size={20} />
            </button>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
