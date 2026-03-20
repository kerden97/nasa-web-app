import { useEffect, useState } from 'react'
import { AlertTriangle, Sparkles } from 'lucide-react'
import ModalFrame from '@/components/Wonders/ModalFrame'
import InfoBox from '@/components/Wonders/InfoBox'
import { fetchApi } from '@/lib/api'
import { formatUtcShortDate } from '@/lib/dateFormat'
import { neoRadarBriefResponseSchema } from '@/schemas/api'
import type { NeoRadarBriefResponse } from '@/types/neowsRadarBrief'
import {
  asteroidWatchRadarBriefDisclaimerLabel,
  asteroidWatchRadarBriefFactsLabel,
  asteroidWatchRadarBriefKicker,
  asteroidWatchRadarBriefLoading,
  asteroidWatchRadarBriefNotesLabel,
  asteroidWatchRadarBriefOverviewLabel,
  asteroidWatchRadarBriefScenarioLabel,
  asteroidWatchRadarBriefTitle,
} from '@/content/asteroidWatchContent'

interface RadarBriefModalProps {
  startDate: string
  endDate: string
  onClose: () => void
}

const radarBriefSessionCache = new Map<string, NeoRadarBriefResponse>()

function FactCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <InfoBox label={label} paddingClassName="p-4" className="dark:bg-slate-950/55">
      <p className="text-base font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
    </InfoBox>
  )
}

function LoadingBlock() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-[92%] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-[88%] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50/85 dark:border-slate-800 dark:bg-slate-950/55"
          />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-[90%] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}

export default function RadarBriefModal({ startDate, endDate, onClose }: RadarBriefModalProps) {
  const cacheKey = `${startDate}:${endDate}`
  const cachedBrief = radarBriefSessionCache.get(cacheKey) ?? null
  const [brief, setBrief] = useState<NeoRadarBriefResponse | null>(cachedBrief)
  const [loading, setLoading] = useState(!cachedBrief)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedBrief) return

    const controller = new AbortController()

    fetchApi(
      '/api/neows/radar-brief',
      { start_date: startDate, end_date: endDate },
      controller.signal,
      neoRadarBriefResponseSchema,
    )
      .then((result) => {
        radarBriefSessionCache.set(cacheKey, result)
        setBrief(result)
        setError(null)
      })
      .catch((fetchError: Error) => {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [cacheKey, cachedBrief, endDate, startDate])

  return (
    <ModalFrame onClose={onClose} maxWidthClass="max-w-4xl" titleId="radar-brief-modal-title">
      <div className="relative flex h-[min(44rem,calc(100vh-7rem))] min-h-[30rem] flex-col">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#0B3D91]/12 blur-3xl" />

        <div className="relative border-b border-slate-200 px-5 pb-5 pt-5 pr-12 dark:border-slate-800 sm:px-8 sm:pb-5 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ui-kicker text-slate-500 dark:text-slate-400">
              {asteroidWatchRadarBriefKicker}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
                brief?.source === 'ai'
                  ? 'border border-[rgba(11,61,145,0.18)] bg-[rgba(11,61,145,0.08)] text-[#0B3D91] dark:border-[rgba(140,184,255,0.28)] dark:bg-[rgba(11,61,145,0.25)] dark:text-[#8CB8FF]'
                  : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
              }`}
            >
              {brief?.source === 'ai' ? 'AI' : 'System'}
            </span>
          </div>
          <h2
            id="radar-brief-modal-title"
            className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl"
          >
            {asteroidWatchRadarBriefTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            {formatUtcShortDate(startDate)}
            {startDate === endDate ? '' : ` to ${formatUtcShortDate(endDate)}`}
          </p>
        </div>

        <div className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-6">
          <div className="min-h-full">
            {loading ? (
              <div className="relative" role="status" aria-live="polite">
                <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Sparkles size={16} className="text-[#0B3D91] dark:text-[#8CB8FF]" />
                  {asteroidWatchRadarBriefLoading}
                </p>
                <LoadingBlock />
              </div>
            ) : error ? (
              <div className="flex min-h-full items-start">
                <div className="w-full rounded-2xl border border-red-300 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Unable to generate the radar brief</p>
                      <p className="mt-1 leading-6">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : brief ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {asteroidWatchRadarBriefOverviewLabel}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {brief.headline}
                  </h3>
                  <p className="mt-3 text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                    {brief.overview}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(11,61,145,0.16)] bg-[rgba(11,61,145,0.06)] p-5 dark:border-[rgba(140,184,255,0.24)] dark:bg-[rgba(11,61,145,0.18)]">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#0B3D91] dark:text-[#8CB8FF]">
                    {asteroidWatchRadarBriefScenarioLabel}
                  </p>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700 dark:text-slate-200">
                    {brief.impactScenario}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {asteroidWatchRadarBriefFactsLabel}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <FactCard
                      label="Closest pass"
                      value={brief.factsUsed.closestApproach.name}
                      detail={`${brief.factsUsed.closestApproach.missDistanceLd.toFixed(2)} LD on ${brief.factsUsed.closestApproach.date}`}
                    />
                    <FactCard
                      label="Fastest object"
                      value={brief.factsUsed.fastestObject.name}
                      detail={`${brief.factsUsed.fastestObject.velocityKmS.toFixed(1)} km/s`}
                    />
                    <FactCard
                      label="Largest object"
                      value={brief.factsUsed.largestObject.name}
                      detail={`${Math.round(brief.factsUsed.largestObject.diameterMeters)} m across`}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {asteroidWatchRadarBriefNotesLabel}
                  </p>
                  <div className="mt-3 space-y-2">
                    {brief.watchNotes.map((note) => (
                      <div
                        key={note}
                        className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-300"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/55">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {asteroidWatchRadarBriefDisclaimerLabel}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {brief.disclaimer}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ModalFrame>
  )
}
