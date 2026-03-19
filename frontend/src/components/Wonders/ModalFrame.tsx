import { useCallback, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useModalBodyLock } from './useModalBodyLock'

interface ModalFrameProps {
  children: ReactNode
  onClose: () => void
  closeLabel?: string
  maxWidthClass?: string
  titleId?: string
}

export default function ModalFrame({
  children,
  onClose,
  closeLabel = 'Close modal',
  maxWidthClass = 'max-w-6xl',
  titleId,
}: ModalFrameProps) {
  useModalBodyLock(true)

  const fallbackId = useId()
  const labelId = titleId ?? fallbackId
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !dialogRef.current) return

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    )

    if (focusable.length === 0) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }, [])

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      trapFocus(event)
    }

    document.addEventListener('keydown', handleKey)

    // Move focus into the dialog on mount
    const closeButton = dialogRef.current?.querySelector<HTMLElement>('button')
    closeButton?.focus()

    return () => {
      document.removeEventListener('keydown', handleKey)
      previousFocusRef.current?.focus()
    }
  }, [onClose, trapFocus])

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex h-full items-start justify-center px-4 pb-4 pt-[89px]">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            className={`relative flex h-[calc(100dvh-89px-1rem)] min-h-0 w-full ${maxWidthClass} max-h-[calc(100dvh-89px-1rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_36px_120px_rgba(15,23,42,0.24)] dark:border-slate-800 dark:bg-slate-900 lg:h-auto lg:max-h-[calc(100dvh-89px-1rem)]`}
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
