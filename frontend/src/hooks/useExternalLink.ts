import { useCallback, useState } from 'react'

interface PendingExternalLink<TLabel extends string> {
  href: string
  hostname: string
  label: TLabel
}

export default function useExternalLink<TLabel extends string>(defaultLabel: TLabel) {
  const [pendingExternalLink, setPendingExternalLink] =
    useState<PendingExternalLink<TLabel> | null>(null)

  const queueExternalLink = useCallback(
    (href: string, label: TLabel = defaultLabel) => {
      const hostname = new URL(href).hostname.replace(/^www\./, '')
      setPendingExternalLink({ href, hostname, label })
    },
    [defaultLabel],
  )

  const confirmExternalLink = useCallback(() => {
    setPendingExternalLink((current) => {
      if (!current) return null

      window.open(current.href, '_blank', 'noopener,noreferrer')
      return null
    })
  }, [])

  const cancelExternalLink = useCallback(() => {
    setPendingExternalLink(null)
  }, [])

  return { pendingExternalLink, queueExternalLink, confirmExternalLink, cancelExternalLink }
}
