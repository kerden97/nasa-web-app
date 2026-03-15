import { useEffect, useRef, useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { APOD_EPOCH } from '@/lib/apodMeta'
import MiniCalendar from '@/components/MiniCalendar'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'

interface DateFilterProps {
  onSingleDate: (date: string) => void
  onDateRange: (start: string, end: string) => void
  onReset: () => void
  isFiltered: boolean
}

/* ── helpers ── */

function clamp(iso: string) {
  if (iso < APOD_EPOCH) return APOD_EPOCH
  const t = todayStr()
  if (iso > t) return t
  return iso
}

/* ── presets ── */

type Preset = { label: string; getRange: () => [string, string] | [string] }

const presets: Preset[] = [
  { label: 'Today', getRange: () => [todayStr()] },
  { label: 'Yesterday', getRange: () => [addDays(todayStr(), -1)] },
  {
    label: 'This week',
    getRange: () => {
      const t = todayStr()
      const d = new Date(`${t}T00:00:00`)
      const day = d.getDay()
      const mon = addDays(t, -(day === 0 ? 6 : day - 1))
      return [clamp(mon), t]
    },
  },
  {
    label: 'Last 7 days',
    getRange: () => {
      const t = todayStr()
      return [clamp(addDays(t, -6)), t]
    },
  },
  {
    label: 'Last 30 days',
    getRange: () => {
      const t = todayStr()
      return [clamp(addDays(t, -29)), t]
    },
  },
  {
    label: 'This month',
    getRange: () => {
      const t = todayStr()
      const start = t.slice(0, 8) + '01'
      return [clamp(start), t]
    },
  },
]

/* ── main component ── */

export default function DateFilter({
  onSingleDate,
  onDateRange,
  onReset,
  isFiltered,
}: DateFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [mode, setMode] = useState<'single' | 'range'>('single')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDateDisabled = (iso: string) => iso > todayStr() || iso < APOD_EPOCH

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function applyPreset(preset: Preset) {
    const result = preset.getRange()
    setActivePreset(preset.label)
    setCalendarOpen(false)
    setRangeStart(null)
    setRangeEnd(null)
    if (result.length === 1) {
      onSingleDate(result[0])
    } else {
      onDateRange(result[0], result[1])
    }
  }

  function handleCalendarSelect(iso: string) {
    if (mode === 'single') {
      setRangeStart(iso)
      setRangeEnd(null)
      setActivePreset(null)
      setCalendarOpen(false)
      onSingleDate(iso)
    } else {
      if (!rangeStart || rangeEnd) {
        setRangeStart(iso)
        setRangeEnd(null)
      } else {
        const [start, end] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso]
        setRangeStart(start)
        setRangeEnd(end)
        setActivePreset(null)
        setCalendarOpen(false)
        onDateRange(start, end)
      }
    }
  }

  function handleReset() {
    setRangeStart(null)
    setRangeEnd(null)
    setActivePreset(null)
    setCalendarOpen(false)
    onReset()
  }

  const selectionLabel = (() => {
    if (activePreset) return activePreset
    if (rangeStart && rangeEnd) return `${formatLabel(rangeStart)} – ${formatLabel(rangeEnd)}`
    if (rangeStart) return formatLabel(rangeStart)
    return null
  })()

  const chipBase =
    'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200'
  const chipIdle =
    'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
  const chipActive =
    'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset chips */}
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => applyPreset(preset)}
          className={`${chipBase} ${activePreset === preset.label ? chipActive : chipIdle}`}
        >
          {preset.label}
        </button>
      ))}

      {/* Custom calendar trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setCalendarOpen(!calendarOpen)}
          className={`${chipBase} inline-flex items-center gap-1.5 ${
            calendarOpen || (isFiltered && !activePreset) ? chipActive : chipIdle
          }`}
        >
          <Calendar size={13} />
          Custom
        </button>

        {calendarOpen && (
          <div className="absolute left-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {/* Single / Range toggle */}
            <div className="mb-3 flex rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('single')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-l-lg`}
              >
                Single date
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('range')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === 'range'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-r-lg`}
              >
                Date range
              </button>
            </div>

            {mode === 'range' && (
              <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                {!rangeStart
                  ? 'Pick a start date'
                  : !rangeEnd
                    ? 'Now pick an end date'
                    : 'Range selected'}
              </p>
            )}

            <MiniCalendar
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoveredDate={mode === 'range' ? hoveredDate : null}
              onSelect={handleCalendarSelect}
              onHover={setHoveredDate}
              isDateDisabled={isDateDisabled}
            />
          </div>
        )}
      </div>

      {/* Active selection label + clear */}
      {isFiltered && (
        <div className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {selectionLabel && <span>{selectionLabel}</span>}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full p-0.5 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-200"
            aria-label="Clear filter"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
