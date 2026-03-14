export const APOD_EPOCH = '1995-06-16'

export function formatApodLongDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function formatApodRelativeDate(date: string): string {
  const target = new Date(`${date}T00:00:00Z`)
  const today = new Date()
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  )
  const diffMs = target.getTime() - todayUtc.getTime()
  const diffDays = Math.round(diffMs / 86_400_000)

  if (diffDays === 0) return 'today'
  if (diffDays === -1) return '1 day ago'
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays === 1) return 'in 1 day'
  return `in ${diffDays} days`
}

export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

export function getApodTeaser(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).trimEnd()}...`
}
