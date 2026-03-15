import { useCallback, useMemo, useRef, useState } from 'react'
import { Calendar, X } from 'lucide-react'
import MiniCalendar from '@/components/MiniCalendar'
import { useClickOutside } from '@/hooks/useClickOutside'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'
import { getDefaultRange } from '@/lib/neoUtils'

interface NeoDateFilterProps {
  defaultRange: { start: string; end: string }
  onChange: (start: string, end: string) => void
}

type NeoPreset = { label: string; getRange: () => [string, string] | [string] }

const chipBase =
  'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200'
const chipIdle =
  'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
const chipActive =
  'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'

export default function NeoDateFilter({ defaultRange, onChange }: NeoDateFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMode, setCalendarMode] = useState<'single' | 'range'>('range')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>('Last 7 days')
  const [currentStart, setCurrentStart] = useState(defaultRange.start)
  const [currentEnd, setCurrentEnd] = useState(defaultRange.end)
  const calendarRef = useRef<HTMLDivElement>(null)

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  useClickOutside(calendarRef, closeCalendar)

  const isDateDisabled = (iso: string) => iso > todayStr()

  const neoPresets: NeoPreset[] = useMemo(
    () => [
      { label: 'Today', getRange: () => [todayStr()] },
      { label: 'Yesterday', getRange: () => [addDays(todayStr(), -1)] },
      {
        label: 'Last 3 days',
        getRange: () => {
          const t = todayStr()
          return [addDays(t, -2), t]
        },
      },
      {
        label: 'Last 7 days',
        getRange: () => {
          const t = todayStr()
          return [addDays(t, -6), t]
        },
      },
    ],
    [],
  )

  const applyPreset = useCallback(
    (preset: NeoPreset) => {
      const result = preset.getRange()
      setActivePreset(preset.label)
      setCalendarOpen(false)
      setRangeStart(null)
      setRangeEnd(null)
      const start = result[0]
      const end = result.length === 1 ? result[0] : result[1]
      setCurrentStart(start)
      setCurrentEnd(end)
      onChange(start, end)
    },
    [onChange],
  )

  const handleCalendarSelect = useCallback(
    (iso: string) => {
      if (calendarMode === 'single') {
        setRangeStart(iso)
        setRangeEnd(null)
        setActivePreset(null)
        setCalendarOpen(false)
        setCurrentStart(iso)
        setCurrentEnd(iso)
        onChange(iso, iso)
      } else {
        if (!rangeStart || rangeEnd) {
          setRangeStart(iso)
          setRangeEnd(null)
        } else {
          const [start, initialEnd] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso]
          const diffMs =
            new Date(`${initialEnd}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()
          const diffDays = diffMs / (1000 * 60 * 60 * 24)
          const end = diffDays > 6 ? addDays(start, 6) : initialEnd
          setRangeStart(start)
          setRangeEnd(end)
          setActivePreset(null)
          setCalendarOpen(false)
          setCurrentStart(start)
          setCurrentEnd(end)
          onChange(start, end)
        }
      }
    },
    [calendarMode, rangeStart, rangeEnd, onChange],
  )

  const handleReset = useCallback(() => {
    const def = getDefaultRange()
    setRangeStart(null)
    setRangeEnd(null)
    setActivePreset('Last 7 days')
    setCalendarOpen(false)
    setCurrentStart(def.start)
    setCurrentEnd(def.end)
    onChange(def.start, def.end)
  }, [onChange])

  const isFiltered = currentStart !== defaultRange.start || currentEnd !== defaultRange.end

  const selectionLabel = (() => {
    if (activePreset) return `Showing: ${activePreset}`
    if (rangeStart && rangeEnd)
      return `Custom range: ${formatLabel(rangeStart)} – ${formatLabel(rangeEnd)}`
    if (rangeStart) return `Custom date: ${formatLabel(rangeStart)}`
    return null
  })()

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {neoPresets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => applyPreset(preset)}
          className={`${chipBase} ${activePreset === preset.label ? chipActive : chipIdle}`}
        >
          {preset.label}
        </button>
      ))}

      <div className="relative" ref={calendarRef}>
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
            <div className="mb-3 flex rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setCalendarMode('single')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  calendarMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-l-lg`}
              >
                Single date
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalendarMode('range')
                  setRangeStart(null)
                  setRangeEnd(null)
                }}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  calendarMode === 'range'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                } rounded-r-lg`}
              >
                Date range
              </button>
            </div>

            {calendarMode === 'range' && (
              <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                {!rangeStart
                  ? 'Pick a start date'
                  : !rangeEnd
                    ? 'Now pick an end date (max 7 days)'
                    : 'Range selected'}
              </p>
            )}

            <MiniCalendar
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoveredDate={calendarMode === 'range' ? hoveredDate : null}
              onSelect={handleCalendarSelect}
              onHover={setHoveredDate}
              isDateDisabled={isDateDisabled}
            />
          </div>
        )}
      </div>

      {isFiltered && (
        <div className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
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
