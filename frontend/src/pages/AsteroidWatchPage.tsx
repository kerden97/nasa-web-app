import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useNeows } from '@/hooks/useNeows'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import Breadcrumbs from '@/components/Breadcrumbs'
import InlineErrorNotice from '@/components/Feedback/InlineErrorNotice'
import {
  AsteroidWatchChartsSkeleton,
  AsteroidWatchSkeletonContent,
} from '@/components/NeoWs/AsteroidWatchSkeleton'
import {
  asteroidWatchEmptyDescription,
  asteroidWatchRadarBriefButton,
  asteroidWatchEmptyTitle,
  asteroidWatchIntroPrimary,
  asteroidWatchIntroSecondary,
  asteroidWatchKicker,
  asteroidWatchTitle,
} from '@/content/asteroidWatchContent'
import NeoDateFilter from '@/components/NeoWs/NeoDateFilter'
import SummaryStats from '@/components/NeoWs/SummaryStats'
import AsteroidTable from '@/components/NeoWs/AsteroidTable'
import type {
  DailyCountItem,
  HazardousDataItem,
  ScatterDataItem,
} from '@/components/NeoWs/NeoCharts'
import { getDefaultRange, shortDate, formatNeoDisplayName } from '@/lib/neoUtils'

const AsteroidChartsSection = lazy(() => import('@/components/NeoWs/AsteroidChartsSection'))
const RadarBriefModal = lazy(() => import('@/components/NeoWs/RadarBriefModal'))

function DeferredAsteroidCharts({
  defer,
  dailyData,
  hazardousData,
  scatterData,
  isDark,
}: {
  defer: boolean
  dailyData: DailyCountItem[]
  hazardousData: HazardousDataItem[]
  scatterData: ScatterDataItem[]
  isDark: boolean
}) {
  const chartsAnchorRef = useRef<HTMLDivElement | null>(null)
  const [shouldRenderCharts, setShouldRenderCharts] = useState(!defer)

  useEffect(() => {
    if (!defer || shouldRenderCharts) return

    const anchor = chartsAnchorRef.current
    if (!anchor) return

    if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      const frameId = window.requestAnimationFrame(() => setShouldRenderCharts(true))
      return () => window.cancelAnimationFrame(frameId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldRenderCharts(true)
          observer.disconnect()
        }
      },
      { rootMargin: '320px 0px' },
    )

    observer.observe(anchor)
    return () => observer.disconnect()
  }, [defer, shouldRenderCharts])

  return (
    <div ref={chartsAnchorRef} className="[content-visibility:auto] [contain-intrinsic-size:65rem]">
      {shouldRenderCharts ? (
        <Suspense fallback={<AsteroidWatchChartsSkeleton />}>
          <AsteroidChartsSection
            dailyData={dailyData}
            hazardousData={hazardousData}
            scatterData={scatterData}
            isDark={isDark}
          />
        </Suspense>
      ) : (
        <AsteroidWatchChartsSkeleton />
      )}
    </div>
  )
}

export default function AsteroidWatchPage() {
  useEffect(() => {
    document.title = 'Asteroid Watch | Home & Beyond'
  }, [])

  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isMobileOrCoarse = useMediaQuery('(max-width: 767px), (pointer: coarse)')

  const defaultRange = useMemo(() => getDefaultRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)
  const [isRadarBriefOpen, setIsRadarBriefOpen] = useState(false)

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
          key: `${neo.id}:${ca.close_approach_date}`,
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

        <div className="mb-6 max-w-4xl">
          <p className="ui-kicker mb-2">{asteroidWatchKicker}</p>
          <h1 className="ui-page-title text-3xl text-slate-900 dark:text-white">
            {asteroidWatchTitle}
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 dark:text-slate-400">
            {asteroidWatchIntroPrimary}
          </p>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-500 dark:text-slate-400">
            {asteroidWatchIntroSecondary}
          </p>
        </div>

        <NeoDateFilter
          defaultRange={defaultRange}
          onChange={handleRangeChange}
          trailingAction={
            <div className="w-full sm:w-auto sm:shrink-0">
              <button
                type="button"
                onClick={() => setIsRadarBriefOpen(true)}
                disabled={loading || !data || !hasResults}
                className="cosmic-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-42"
              >
                <Sparkles size={15} />
                <span>{asteroidWatchRadarBriefButton}</span>
              </button>
            </div>
          }
        />

        <div aria-live="polite" className="sr-only">
          {loading
            ? 'Loading asteroid data...'
            : data && hasResults
              ? `${allNeos.length} near-Earth object${allNeos.length === 1 ? '' : 's'} loaded`
              : ''}
        </div>

        {loading && <AsteroidWatchSkeletonContent />}

        {error && !loading && (
          <InlineErrorNotice title="Unable to load asteroid data" message={error} />
        )}

        {data && !loading && hasResults && (
          <>
            <SummaryStats allNeos={allNeos} />

            <DeferredAsteroidCharts
              key={`${startDate}:${endDate}:${isMobileOrCoarse ? 'mobile' : 'desktop'}`}
              defer={isMobileOrCoarse}
              dailyData={dailyData}
              hazardousData={hazardousData}
              scatterData={scatterData}
              isDark={isDark}
            />

            <div className="[content-visibility:auto] [contain-intrinsic-size:88rem]">
              <AsteroidTable neos={allNeos} />
            </div>
          </>
        )}

        {data && !loading && !error && !hasResults && (
          <div className="rounded-[28px] border border-slate-200 bg-white/88 px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-900/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.25)]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {asteroidWatchEmptyTitle}
            </h2>
            <p className="mt-2 text-base leading-8 text-slate-600 dark:text-slate-300">
              {asteroidWatchEmptyDescription}
            </p>
          </div>
        )}

        {isRadarBriefOpen && hasResults && (
          <Suspense fallback={null}>
            <RadarBriefModal
              key={`${startDate}:${endDate}`}
              startDate={startDate}
              endDate={endDate}
              onClose={() => setIsRadarBriefOpen(false)}
            />
          </Suspense>
        )}
      </div>
    </section>
  )
}
