import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { Calendar, X } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useNeows } from '@/hooks/useNeows'
import MiniCalendar from '@/components/MiniCalendar'
import Breadcrumbs from '@/components/Breadcrumbs'
import { addDays, formatLabel, todayStr } from '@/lib/calendarUtils'
import AsteroidWatchSkeleton from '@/components/NeoWs/AsteroidWatchSkeleton'
import type { NeoObject } from '@/types/neows'

type SortKey = 'name' | 'date' | 'diameter' | 'distance' | 'velocity' | 'hazardous'

function getDefaultRange(): { start: string; end: string } {
  const t = todayStr()
  return { start: addDays(t, -6), end: t }
}

function shortDate(dateStr: string): string {
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

function formatNeoDisplayName(name: string): string {
  const trimmed = name.trim()
  const numberedDesignation = trimmed.match(/^\d+\s+\((.+)\)$/)
  if (numberedDesignation?.[1]) return numberedDesignation[1]

  const provisionalDesignation = trimmed.match(/^\((.+)\)$/)
  if (provisionalDesignation?.[1]) return provisionalDesignation[1]

  return trimmed
}

// Recharts custom tooltip for bar chart
function DailyCountTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: { date: string; safe: number; hazardous: number; total: number } }[]
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-white">{d.date}</p>
      <p className="text-slate-600 dark:text-slate-300">
        {d.total} asteroid{d.total !== 1 ? 's' : ''}
      </p>
      {d.hazardous > 0 && <p className="text-red-500">{d.hazardous} hazardous</p>}
    </div>
  )
}

// Recharts custom tooltip for scatter chart
function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: {
    payload: {
      name: string
      distance: number
      diameter: number
      velocity: number
      hazardous: boolean
    }
  }[]
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-900 dark:text-white">{d.name}</p>
      <p className="text-slate-600 dark:text-slate-300">Distance: {d.distance.toFixed(2)} lunar</p>
      <p className="text-slate-600 dark:text-slate-300">Velocity: {d.velocity.toFixed(1)} km/s</p>
      <p className="text-slate-600 dark:text-slate-300">Diameter: {d.diameter.toFixed(0)} m</p>
      {d.hazardous && <p className="font-medium text-red-500">Potentially hazardous</p>}
    </div>
  )
}

export default function AsteroidWatchPage() {
  useEffect(() => {
    document.title = 'Asteroid Watch | Home & Beyond'
  }, [])

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const defaultRange = useMemo(() => getDefaultRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)

  // Date filter state
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMode, setCalendarMode] = useState<'single' | 'range'>('range')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>('Last 7 days')
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isDateDisabled = (iso: string) => iso > todayStr()

  type NeoPreset = { label: string; getRange: () => [string, string] | [string] }

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

  function applyNeoPreset(preset: NeoPreset) {
    const result = preset.getRange()
    setActivePreset(preset.label)
    setCalendarOpen(false)
    setRangeStart(null)
    setRangeEnd(null)
    if (result.length === 1) {
      setStartDate(result[0])
      setEndDate(result[0])
    } else {
      setStartDate(result[0])
      setEndDate(result[1])
    }
  }

  function handleNeoCalendarSelect(iso: string) {
    if (calendarMode === 'single') {
      setRangeStart(iso)
      setRangeEnd(null)
      setActivePreset(null)
      setCalendarOpen(false)
      setStartDate(iso)
      setEndDate(iso)
    } else {
      if (!rangeStart || rangeEnd) {
        setRangeStart(iso)
        setRangeEnd(null)
      } else {
        const [start, initialEnd] = iso < rangeStart ? [iso, rangeStart] : [rangeStart, iso]
        // Enforce max 7-day range
        const diffMs =
          new Date(`${initialEnd}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        const end = diffDays > 6 ? addDays(start, 6) : initialEnd
        setRangeStart(start)
        setRangeEnd(end)
        setActivePreset(null)
        setCalendarOpen(false)
        setStartDate(start)
        setEndDate(end)
      }
    }
  }

  function handleNeoReset() {
    const def = getDefaultRange()
    setRangeStart(null)
    setRangeEnd(null)
    setActivePreset('Last 7 days')
    setCalendarOpen(false)
    setStartDate(def.start)
    setEndDate(def.end)
  }

  const isNeoFiltered = startDate !== defaultRange.start || endDate !== defaultRange.end

  const neoSelectionLabel = (() => {
    if (activePreset) return `Showing: ${activePreset}`
    if (rangeStart && rangeEnd)
      return `Custom range: ${formatLabel(rangeStart)} – ${formatLabel(rangeEnd)}`
    if (rangeStart) return `Custom date: ${formatLabel(rangeStart)}`
    return null
  })()

  const chipBase =
    'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200'
  const chipIdle =
    'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
  const chipActive =
    'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'

  const { data, loading, error } = useNeows(startDate, endDate)

  // Flatten all NEOs across all dates
  const allNeos = useMemo(() => {
    if (!data) return []
    return Object.values(data.near_earth_objects).flat()
  }, [data])

  // Daily count data for bar chart
  const dailyData = useMemo(() => {
    if (!data) return []
    return Object.entries(data.near_earth_objects)
      .map(([date, neos]) => {
        const hazardous = neos.filter((n) => n.is_potentially_hazardous_asteroid).length
        return {
          date: shortDate(date),
          fullDate: date,
          safe: neos.length - hazardous,
          hazardous,
          total: neos.length,
        }
      })
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
  }, [data])

  // Scatter data: distance vs diameter
  const scatterData = useMemo(() => {
    return allNeos
      .filter((neo) => neo.close_approach_data[0])
      .map((neo) => {
        const ca = neo.close_approach_data[0]!
        const avgDiameter =
          (neo.estimated_diameter.meters.estimated_diameter_min +
            neo.estimated_diameter.meters.estimated_diameter_max) /
          2
        return {
          name: formatNeoDisplayName(neo.name),
          distance: parseFloat(ca.miss_distance.lunar),
          diameter: avgDiameter,
          hazardous: neo.is_potentially_hazardous_asteroid,
          velocity: parseFloat(ca.relative_velocity.kilometers_per_second),
        }
      })
  }, [allNeos])

  // Hazardous breakdown for pie chart
  const hazardousData = useMemo(() => {
    const hazardous = allNeos.filter((n) => n.is_potentially_hazardous_asteroid).length
    const safe = allNeos.length - hazardous
    const entries: { name: string; value: number; color: string }[] = []
    if (safe > 0)
      entries.push({ name: 'Not Hazardous', value: safe, color: isDark ? '#60a5fa' : '#3b82f6' })
    if (hazardous > 0)
      entries.push({ name: 'Potentially Hazardous', value: hazardous, color: '#ef4444' })
    return entries
  }, [allNeos, isDark])

  // Summary stats
  const stats = useMemo(() => {
    if (!allNeos.length) return null
    const hazardous = allNeos.filter((n) => n.is_potentially_hazardous_asteroid).length

    let closest: NeoObject | null = null
    let closestDist = Infinity
    let fastest: NeoObject | null = null
    let fastestSpeed = 0
    let largest: NeoObject | null = null
    let largestSize = 0

    for (const neo of allNeos) {
      const ca = neo.close_approach_data[0]
      if (ca) {
        const dist = parseFloat(ca.miss_distance.lunar)
        if (dist < closestDist) {
          closestDist = dist
          closest = neo
        }
        const speed = parseFloat(ca.relative_velocity.kilometers_per_second)
        if (speed > fastestSpeed) {
          fastestSpeed = speed
          fastest = neo
        }
      }
      const avgD =
        (neo.estimated_diameter.meters.estimated_diameter_min +
          neo.estimated_diameter.meters.estimated_diameter_max) /
        2
      if (avgD > largestSize) {
        largestSize = avgD
        largest = neo
      }
    }

    return {
      total: allNeos.length,
      hazardous,
      closest,
      closestDist,
      fastest,
      fastestSpeed,
      largest,
      largestSize,
    }
  }, [allNeos])

  // Table sort & pagination
  const [sortKey, setSortKey] = useState<SortKey>('distance')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPageRaw] = useState(25)

  const handleRowsPerPage = useCallback((n: number) => {
    setRowsPerPageRaw(n)
    setPage(0)
  }, [])

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortAsc((prev) => !prev)
      } else {
        setSortKey(key)
        setSortAsc(true)
      }
      setPage(0)
    },
    [sortKey],
  )

  const getNeoValue = useCallback((neo: NeoObject, key: SortKey): string | number | boolean => {
    const ca = neo.close_approach_data[0]
    switch (key) {
      case 'name':
        return formatNeoDisplayName(neo.name).toLowerCase()
      case 'date':
        return ca?.close_approach_date ?? ''
      case 'diameter':
        return (
          (neo.estimated_diameter.meters.estimated_diameter_min +
            neo.estimated_diameter.meters.estimated_diameter_max) /
          2
        )
      case 'distance':
        return ca ? parseFloat(ca.miss_distance.lunar) : 0
      case 'velocity':
        return ca ? parseFloat(ca.relative_velocity.kilometers_per_second) : 0
      case 'hazardous':
        return neo.is_potentially_hazardous_asteroid ? 1 : 0
    }
  }, [])

  const sortedNeos = useMemo(() => {
    return [...allNeos].sort((a, b) => {
      const aVal = getNeoValue(a, sortKey)
      const bVal = getNeoValue(b, sortKey)
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortAsc ? cmp : -cmp
    })
  }, [allNeos, sortKey, sortAsc, getNeoValue])

  const totalPages = Math.max(1, Math.ceil(sortedNeos.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages - 1)
  const paginatedNeos = sortedNeos.slice(clampedPage * rowsPerPage, (clampedPage + 1) * rowsPerPage)
  const hasResults = allNeos.length > 0

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Asteroid Watch' }]} />

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            ☄️
          </span>
          <h1 className="font-nasa text-3xl tracking-widest text-slate-900 dark:text-white">
            Asteroid Watch
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Track near-Earth objects approaching our planet. Visualize asteroid count, size, velocity,
          and miss distance from NASA&apos;s NeoWs data — updated daily.
        </p>
      </div>

      {/* Date filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {neoPresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyNeoPreset(preset)}
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
              calendarOpen || (isNeoFiltered && !activePreset) ? chipActive : chipIdle
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
                onSelect={handleNeoCalendarSelect}
                onHover={setHoveredDate}
                isDateDisabled={isDateDisabled}
              />
            </div>
          )}
        </div>

        {isNeoFiltered && (
          <div className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {neoSelectionLabel && <span>{neoSelectionLabel}</span>}
            <button
              type="button"
              onClick={handleNeoReset}
              className="rounded-full p-0.5 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-200"
              aria-label="Clear filter"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && <AsteroidWatchSkeleton />}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Data */}
      {data && !loading && hasResults && (
        <>
          {/* Summary stats */}
          {stats && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total asteroids"
                value={stats.total}
                detail={`${stats.hazardous} potentially hazardous`}
                accent={stats.hazardous > 0 ? 'red' : 'blue'}
              />
              <StatCard
                label="Closest approach"
                value={`${stats.closestDist.toFixed(1)} LD`}
                detail={stats.closest ? formatNeoDisplayName(stats.closest.name) : '—'}
                accent="amber"
              />
              <StatCard
                label="Fastest"
                value={`${stats.fastestSpeed.toFixed(1)} km/s`}
                detail={stats.fastest ? formatNeoDisplayName(stats.fastest.name) : '—'}
                accent="blue"
              />
              <StatCard
                label="Largest (est.)"
                value={`${stats.largestSize.toFixed(0)} m`}
                detail={stats.largest ? formatNeoDisplayName(stats.largest.name) : '—'}
                accent="blue"
              />
            </div>
          )}

          {/* Charts grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar chart — daily count */}
            <ChartCard title="Daily Near-Earth Objects">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: textColor }} />
                  <Tooltip content={<DailyCountTooltip />} />
                  <Bar
                    dataKey="safe"
                    stackId="a"
                    fill={isDark ? '#60a5fa' : '#3b82f6'}
                    name="Not Hazardous"
                  />
                  <Bar
                    dataKey="hazardous"
                    stackId="a"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Hazardous"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie chart — hazardous breakdown */}
            <ChartCard title="Hazardous Classification">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hazardousData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={hazardousData.length > 1 ? 4 : 0}
                    dataKey="value"
                  >
                    {hazardousData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value: string, entry: { payload?: { value?: number } }) =>
                      `${value}: ${entry.payload?.value ?? 0}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                NASA classifies an asteroid as potentially hazardous when its minimum orbit
                intersection distance is ≤ 0.05 AU and its diameter is ≥ ~140 m (H ≤ 22).
              </p>
            </ChartCard>

            {/* Scatter chart — velocity vs distance */}
            <ChartCard title="Velocity vs. Miss Distance" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    type="number"
                    dataKey="distance"
                    name="Miss Distance"
                    unit=" LD"
                    padding={{ left: 5 }}
                    tick={{ fontSize: 12, fill: textColor }}
                    label={{
                      value: 'Miss Distance (Lunar Distances)',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 12, fill: textColor },
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="velocity"
                    name="Velocity"
                    unit=" km/s"
                    tick={{ fontSize: 12, fill: textColor }}
                    label={{
                      value: 'Relative Velocity (km/s)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
                      dy: 0,
                      style: { fontSize: 12, fill: textColor, textAnchor: 'middle' },
                    }}
                    width={80}
                  />
                  <ZAxis type="number" dataKey="diameter" range={[40, 400]} name="Diameter" />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.hazardous ? '#ef4444' : isDark ? '#60a5fa' : '#3b82f6'}
                        fillOpacity={0.7}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="mt-2 pl-20 text-center text-xs text-slate-400 dark:text-slate-500">
                Dot size represents estimated diameter. Red = potentially hazardous.
              </p>
            </ChartCard>
          </div>

          {/* Asteroid table */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Near-Earth Objects
              </h2>
              <RowsPerPageDropdown
                id="neo-rows-top"
                value={rowsPerPage}
                onChange={handleRowsPerPage}
              />
            </div>
            <div className="scrollbar-thin overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-215 w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-45" />
                  <col className="w-30" />
                  <col className="w-32.5" />
                  <col className="w-40" />
                  <col className="w-27.5" />
                  <col className="w-30" />
                </colgroup>
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <SortableHeader
                      label="Name"
                      sortKey="name"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Diameter (m)"
                      sortKey="diameter"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Velocity (km/s)"
                      sortKey="velocity"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Miss Distance (LD)"
                      sortKey="distance"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Hazardous"
                      sortKey="hazardous"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Date"
                      sortKey="date"
                      currentKey={sortKey}
                      asc={sortAsc}
                      onSort={handleSort}
                      align="right"
                    />
                  </tr>
                </thead>
                <tbody>
                  {paginatedNeos.map((neo) => {
                    const ca = neo.close_approach_data[0]
                    const avgD =
                      (neo.estimated_diameter.meters.estimated_diameter_min +
                        neo.estimated_diameter.meters.estimated_diameter_max) /
                      2
                    return (
                      <tr
                        key={neo.id}
                        className="border-b border-slate-100 transition odd:bg-white even:bg-slate-50/55 hover:bg-slate-100 dark:border-slate-800/50 dark:odd:bg-slate-950 dark:even:bg-slate-900/70 dark:hover:bg-slate-800/70"
                      >
                        <td
                          className="truncate px-4 py-3 font-medium text-slate-900 dark:text-white"
                          title={formatNeoDisplayName(neo.name)}
                        >
                          {formatNeoDisplayName(neo.name)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {avgD.toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {ca
                            ? parseFloat(ca.relative_velocity.kilometers_per_second).toFixed(1)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {ca ? parseFloat(ca.miss_distance.lunar).toFixed(2) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {neo.is_potentially_hazardous_asteroid ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                          {ca?.close_approach_date ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              LD (Lunar Distance) = ~384,400 km, the average distance from Earth to the Moon.
            </p>

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <span>Rows per page:</span>
                <RowsPerPageDropdown
                  id="neo-rows-bottom"
                  value={rowsPerPage}
                  onChange={handleRowsPerPage}
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                <span>
                  {clampedPage * rowsPerPage + 1}–
                  {Math.min((clampedPage + 1) * rowsPerPage, sortedNeos.length)} of{' '}
                  {sortedNeos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={clampedPage === 0}
                  className="rounded-md p-1.5 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
                  aria-label="Previous page"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={clampedPage >= totalPages - 1}
                  className="rounded-md p-1.5 transition hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-800"
                  aria-label="Next page"
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {data && !loading && !error && !hasResults && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            No near-Earth objects found for this range
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Try another date or a broader 7-day window to explore recent NeoWs activity.
          </p>
        </div>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string | number
  detail: string
  accent: 'blue' | 'red' | 'amber'
}) {
  const accentColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accentColors[accent]}`}>{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  asc,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const active = sortKey === currentKey
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 font-medium text-slate-600 dark:text-slate-400${align === 'right' ? ' text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white${align === 'right' ? ' ml-auto' : ''}`}
      >
        {label}
        <span className="inline-flex flex-col text-[10px] leading-none">
          <span className={active && asc ? 'text-blue-600 dark:text-blue-400' : 'opacity-30'}>
            ▲
          </span>
          <span className={active && !asc ? 'text-blue-600 dark:text-blue-400' : 'opacity-30'}>
            ▼
          </span>
        </span>
      </button>
    </th>
  )
}

function RowsPerPageDropdown({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (n: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = `${id}-panel`

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        id={id}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={menuId}
        aria-label="Rows per page"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 sm:text-sm"
      >
        <span>{value}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`ml-1 h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-10 mt-1 w-14 origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          role="menu"
          aria-labelledby={id}
        >
          {([25, 50, 100] as const).map((n) => (
            <button
              type="button"
              key={n}
              role="menuitem"
              onClick={() => {
                onChange(n)
                setOpen(false)
              }}
              className={`block w-full rounded px-2 py-1.5 text-center text-xs font-medium transition sm:text-sm ${
                n === value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 ${direction === 'left' ? 'rotate-90' : '-rotate-90'}`}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className ?? ''}`}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  )
}
