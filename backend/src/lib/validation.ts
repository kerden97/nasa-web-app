export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false

  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}
