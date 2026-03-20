function parseUtcInput(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00Z`)
  }

  if (/^\d{4}-\d{2}-\d{2} /.test(value)) {
    return new Date(`${value.replace(' ', 'T')}Z`)
  }

  return new Date(value)
}

const utcLongDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

const utcMediumDateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

const utcShortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export function formatUtcLongDate(value: string): string {
  return utcLongDateFormatter.format(parseUtcInput(value))
}

export function formatUtcMediumDate(value: string): string {
  return utcMediumDateFormatter.format(parseUtcInput(value))
}

export function formatUtcShortDate(value: string): string {
  return utcShortDateFormatter.format(parseUtcInput(value))
}
