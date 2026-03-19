import { useCallback, useMemo, useState } from 'react'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'
import { getDefaultRange } from '@/lib/neoUtils'

export type CalendarMode = 'single' | 'range'

export interface NeoPreset {
  label: string
  getRange: () => [string] | [string, string]
}

interface NeoDateFilterStateProps {
  defaultRange: { start: string; end: string }
  onChange: (start: string, end: string) => void
}

interface AppliedRange {
  start: string
  end: string
}

interface DraftRange {
  start: string | null
  end: string | null
}

function createNeoPresets(): NeoPreset[] {
  return [
    { label: 'Today', getRange: () => [todayStr()] },
    { label: 'Yesterday', getRange: () => [addDays(todayStr(), -1)] },
    {
      label: 'Last 3 days',
      getRange: () => {
        const today = todayStr()
        return [addDays(today, -2), today]
      },
    },
    {
      label: 'Last 7 days',
      getRange: () => {
        const today = todayStr()
        return [addDays(today, -6), today]
      },
    },
  ]
}

function resolvePresetRange(preset: NeoPreset): AppliedRange {
  const [start, maybeEnd] = preset.getRange()
  return { start, end: maybeEnd ?? start }
}

function resolveBoundedRange(start: string, end: string): AppliedRange {
  const diffMs = new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return {
    start,
    end: diffDays > 6 ? addDays(start, 6) : end,
  }
}

function buildSelectionLabel(activePreset: string | null, draftRange: DraftRange): string | null {
  if (activePreset) return activePreset
  if (draftRange.start && draftRange.end) {
    return `${formatLabel(draftRange.start)} – ${formatLabel(draftRange.end)}`
  }
  if (draftRange.start) return formatLabel(draftRange.start)
  return null
}

function buildRangeHint(mode: CalendarMode, draftRange: DraftRange): string | null {
  if (mode !== 'range') return null
  if (!draftRange.start) return 'Pick a start date'
  if (!draftRange.end) return 'Now pick an end date (max 7 days)'
  return 'Range selected'
}

export function isNeoDateDisabled(iso: string): boolean {
  return iso > todayStr()
}

export function useNeoDateFilterState({ defaultRange, onChange }: NeoDateFilterStateProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('range')
  const [draftRange, setDraftRange] = useState<DraftRange>({ start: null, end: null })
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>('Last 7 days')
  const [appliedRange, setAppliedRange] = useState<AppliedRange>(defaultRange)

  const neoPresets = useMemo(() => createNeoPresets(), [])

  const closeCalendar = useCallback(() => setCalendarOpen(false), [])
  const toggleCalendar = useCallback(() => setCalendarOpen((open) => !open), [])

  const resetDraftRange = useCallback(() => {
    setDraftRange({ start: null, end: null })
  }, [])

  const applyRange = useCallback(
    (range: AppliedRange, presetLabel: string | null) => {
      setActivePreset(presetLabel)
      setAppliedRange(range)
      setCalendarOpen(false)
      onChange(range.start, range.end)
    },
    [onChange],
  )

  const applyPreset = useCallback(
    (preset: NeoPreset) => {
      resetDraftRange()
      applyRange(resolvePresetRange(preset), preset.label)
    },
    [applyRange, resetDraftRange],
  )

  const setSingleDateMode = useCallback(() => {
    setCalendarMode('single')
    resetDraftRange()
  }, [resetDraftRange])

  const setRangeMode = useCallback(() => {
    setCalendarMode('range')
    resetDraftRange()
  }, [resetDraftRange])

  const handleCalendarSelect = useCallback(
    (iso: string) => {
      if (calendarMode === 'single') {
        const nextDraft = { start: iso, end: null }
        setDraftRange(nextDraft)
        applyRange({ start: iso, end: iso }, null)
        return
      }

      if (!draftRange.start || draftRange.end) {
        setDraftRange({ start: iso, end: null })
        return
      }

      const boundedRange =
        iso < draftRange.start
          ? resolveBoundedRange(iso, draftRange.start)
          : resolveBoundedRange(draftRange.start, iso)

      setDraftRange(boundedRange)
      applyRange(boundedRange, null)
    },
    [applyRange, calendarMode, draftRange],
  )

  const handleReset = useCallback(() => {
    const nextDefaultRange = getDefaultRange()
    resetDraftRange()
    applyRange(nextDefaultRange, 'Last 7 days')
  }, [applyRange, resetDraftRange])

  const isFiltered =
    appliedRange.start !== defaultRange.start || appliedRange.end !== defaultRange.end

  const selectionLabel = buildSelectionLabel(activePreset, draftRange)
  const rangeHint = buildRangeHint(calendarMode, draftRange)
  const mobilePrimaryPreset =
    neoPresets.find((preset) => preset.label === activePreset) ?? neoPresets[0]

  return {
    activePreset,
    applyPreset,
    calendarMode,
    calendarOpen,
    closeCalendar,
    draftRange,
    handleCalendarSelect,
    handleReset,
    hoveredDate,
    isFiltered,
    mobilePrimaryPreset,
    neoPresets,
    rangeHint,
    selectionLabel,
    setHoveredDate,
    setRangeMode,
    setSingleDateMode,
    toggleCalendar,
  }
}
