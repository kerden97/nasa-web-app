import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { todayStr } from '@/lib/calendarUtils'

function monthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay() // 0 = Sun
}

function isBetween(iso: string, a: string, b: string) {
  const [lo, hi] = a <= b ? [a, b] : [b, a]
  return iso >= lo && iso <= hi
}

/* ── component ── */

interface MiniCalendarProps {
  rangeStart: string | null
  rangeEnd: string | null
  hoveredDate: string | null
  onSelect: (iso: string) => void
  onHover: (iso: string | null) => void
  isDateDisabled?: (iso: string) => boolean
}

export default function MiniCalendar({
  rangeStart,
  rangeEnd,
  hoveredDate,
  onSelect,
  onHover,
  isDateDisabled,
}: MiniCalendarProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const days = monthDays(viewYear, viewMonth)
  const startDay = firstWeekday(viewYear, viewMonth)
  const today = todayStr()

  const defaultDisabled = (iso: string) => iso > today

  const checkDisabled = isDateDisabled ?? defaultDisabled

  function prev() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function next() {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear
    const firstOfNext = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`
    if (firstOfNext > today) return
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const effectiveEnd = rangeEnd ?? hoveredDate

  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <div className="w-70 select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={next}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7" onMouseLeave={() => onHover(null)}>
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />

          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const disabled = checkDisabled(iso)
          const isToday = iso === today
          const isSelected = iso === rangeStart || iso === rangeEnd
          const inRange =
            rangeStart && effectiveEnd ? isBetween(iso, rangeStart, effectiveEnd) : false

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              onMouseEnter={() => onHover(iso)}
              className={`relative py-1.5 text-xs transition-colors ${
                disabled
                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-700'
                  : 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950'
              } ${inRange && !isSelected ? 'bg-blue-50 dark:bg-blue-950/50' : ''} ${
                isSelected
                  ? 'rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-600 dark:hover:bg-blue-600'
                  : ''
              } ${isToday && !isSelected ? 'font-semibold text-blue-600 dark:text-blue-400' : ''} ${
                !disabled && !isSelected ? 'text-slate-700 dark:text-slate-300' : ''
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
