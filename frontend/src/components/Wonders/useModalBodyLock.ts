import { useEffect } from 'react'

interface ModalBodyLockSnapshot {
  bodyOverflow: string
  bodyPaddingRight: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  htmlOverflow: string
  htmlOverscrollBehavior: string
  scrollY: number
}

let activeModalLocks = 0
let modalBodyLockSnapshot: ModalBodyLockSnapshot | null = null

function applyModalBodyLock(): void {
  const scrollY = window.scrollY
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  modalBodyLockSnapshot = {
    bodyOverflow: document.body.style.overflow,
    bodyPaddingRight: document.body.style.paddingRight,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyLeft: document.body.style.left,
    bodyRight: document.body.style.right,
    bodyWidth: document.body.style.width,
    htmlOverflow: document.documentElement.style.overflow,
    htmlOverscrollBehavior: document.documentElement.style.overscrollBehavior,
    scrollY,
  }

  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
}

function releaseModalBodyLock(): void {
  if (!modalBodyLockSnapshot) return

  document.body.style.overflow = modalBodyLockSnapshot.bodyOverflow
  document.body.style.paddingRight = modalBodyLockSnapshot.bodyPaddingRight
  document.body.style.position = modalBodyLockSnapshot.bodyPosition
  document.body.style.top = modalBodyLockSnapshot.bodyTop
  document.body.style.left = modalBodyLockSnapshot.bodyLeft
  document.body.style.right = modalBodyLockSnapshot.bodyRight
  document.body.style.width = modalBodyLockSnapshot.bodyWidth
  document.documentElement.style.overflow = modalBodyLockSnapshot.htmlOverflow
  document.documentElement.style.overscrollBehavior = modalBodyLockSnapshot.htmlOverscrollBehavior
  window.scrollTo(0, modalBodyLockSnapshot.scrollY)
  modalBodyLockSnapshot = null
}

export function useModalBodyLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return

    activeModalLocks += 1
    if (activeModalLocks === 1) {
      applyModalBodyLock()
    }

    return () => {
      activeModalLocks = Math.max(0, activeModalLocks - 1)
      if (activeModalLocks === 0) {
        releaseModalBodyLock()
      }
    }
  }, [isActive])
}
