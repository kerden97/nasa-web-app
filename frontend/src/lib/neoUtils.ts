import { addDays, todayStr } from '@/lib/calendarUtils'

export type SortKey = 'name' | 'date' | 'diameter' | 'distance' | 'velocity' | 'hazardous'

export function getDefaultRange(): { start: string; end: string } {
  const t = todayStr()
  return { start: addDays(t, -6), end: t }
}

export function shortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  const months = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[Number(m)]} ${Number(d)}`
}

export function formatNeoDisplayName(name: string): string {
  const trimmed = name.trim()
  const numberedDesignation = trimmed.match(/^\d+\s+\((.+)\)$/)
  if (numberedDesignation?.[1]) return numberedDesignation[1]

  const provisionalDesignation = trimmed.match(/^\((.+)\)$/)
  if (provisionalDesignation?.[1]) return provisionalDesignation[1]

  return trimmed
}
