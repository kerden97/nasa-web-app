import type { ReactNode } from 'react'

interface ModalShellProps {
  /** Left panel content (image, video, etc.) */
  media: ReactNode
  /** Sticky header content (date pill, badges, title) */
  header: ReactNode
  /** Scrollable body content */
  children: ReactNode
  /** Desktop-only bottom footer (links, info boxes) */
  footer?: ReactNode
}

export default function ModalShell({ media, header, children, footer }: ModalShellProps) {
  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-full flex-col lg:grid lg:h-[48rem] lg:max-h-[calc(100vh-73px-2rem)] lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="flex shrink-0 min-h-[14rem] max-h-[36svh] items-center justify-center bg-black sm:min-h-[18rem] sm:max-h-[46svh] lg:max-h-none">
          {media}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200 bg-white/98 p-4 dark:border-slate-800 dark:bg-slate-900/96 lg:border-l lg:border-t-0 lg:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#0B3D91]/12 blur-3xl" />

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-slate-200 bg-white/96 px-4 pb-4 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/96 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pb-5 lg:pt-8">
              {header}
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-hidden lg:mt-5">
              <div className="scrollbar-thin h-full overflow-y-auto overscroll-contain pr-1 lg:pr-2">
                {children}
              </div>
            </div>

            {footer && (
              <div className="mt-6 hidden shrink-0 gap-5 border-t border-slate-200 pt-5 dark:border-slate-800 lg:grid">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
