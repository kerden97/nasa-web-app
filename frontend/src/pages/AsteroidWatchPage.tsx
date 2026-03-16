import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useNeows } from '@/hooks/useNeows'
import Breadcrumbs from '@/components/Breadcrumbs'
import AsteroidWatchSkeleton from '@/components/NeoWs/AsteroidWatchSkeleton'
import NeoDateFilter from '@/components/NeoWs/NeoDateFilter'
import SummaryStats from '@/components/NeoWs/SummaryStats'
import AsteroidTable from '@/components/NeoWs/AsteroidTable'
import {
  ChartCard,
  DailyCountChart,
  HazardousPieChart,
  VelocityScatterChart,
} from '@/components/NeoWs/NeoCharts'
import type {
  DailyCountItem,
  ScatterDataItem,
  HazardousDataItem,
} from '@/components/NeoWs/NeoCharts'
import { getDefaultRange, shortDate, formatNeoDisplayName } from '@/lib/neoUtils'

export default function AsteroidWatchPage() {
  useEffect(() => {
    document.title = 'Asteroid Watch | Home & Beyond'
  }, [])

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const defaultRange = useMemo(() => getDefaultRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)

  const handleRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }, [])

  const { data, loading, error } = useNeows(startDate, endDate)

  const allNeos = useMemo(() => {
    if (!data) return []
    return Object.values(data.near_earth_objects).flat()
  }, [data])

  const dailyData: DailyCountItem[] = useMemo(() => {
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

  const scatterData: ScatterDataItem[] = useMemo(() => {
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

  const hazardousData: HazardousDataItem[] = useMemo(() => {
    const hazardous = allNeos.filter((n) => n.is_potentially_hazardous_asteroid).length
    const safe = allNeos.length - hazardous
    const entries: HazardousDataItem[] = []
    if (safe > 0)
      entries.push({ name: 'Not Hazardous', value: safe, color: isDark ? '#60a5fa' : '#3b82f6' })
    if (hazardous > 0)
      entries.push({ name: 'Potentially Hazardous', value: hazardous, color: '#ef4444' })
    return entries
  }, [allNeos, isDark])

  const hasResults = allNeos.length > 0

  return (
    <section className="bg-slate-50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            Track near-Earth objects approaching our planet. Visualize asteroid count, size,
            velocity, and miss distance from NASA&apos;s NeoWs data — updated daily.
          </p>
        </div>

        <NeoDateFilter defaultRange={defaultRange} onChange={handleRangeChange} />

        {loading && <AsteroidWatchSkeleton />}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        {data && !loading && hasResults && (
          <>
            <SummaryStats allNeos={allNeos} />

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Daily Near-Earth Objects">
                <DailyCountChart data={dailyData} isDark={isDark} />
              </ChartCard>

              <ChartCard title="Hazardous Classification">
                <HazardousPieChart data={hazardousData} />
              </ChartCard>

              <ChartCard title="Velocity vs. Miss Distance" className="lg:col-span-2">
                <VelocityScatterChart data={scatterData} isDark={isDark} />
              </ChartCard>
            </div>

            <AsteroidTable neos={allNeos} />
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
      </div>
    </section>
  )
}
