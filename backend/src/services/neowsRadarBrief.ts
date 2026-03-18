import crypto from 'node:crypto'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { buildDurableCacheKey, durableCache } from '../lib/durableCache'
import logger from '../lib/logger'
import { openai, openAiEnabled, radarBriefModel } from '../lib/openai'
import type { NeoFeedResult, NeoObject } from '../types/neows'
import type {
  CachedNeoRadarBrief,
  NeoRadarBriefContent,
  NeoRadarBriefFacts,
  NeoRadarBriefObject,
  NeoRadarBriefResponse,
} from '../types/neowsRadarBrief'
import { fetchNeoFeed } from './neows'

const RADAR_BRIEF_PROMPT_VERSION = 1
const inflightBriefs = new Map<string, Promise<NeoRadarBriefResponse>>()

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatNeoDisplayName(name: string): string {
  const trimmed = name.trim()
  const numberedDesignation = trimmed.match(/^\d+\s+\((.+)\)$/)
  if (numberedDesignation?.[1]) return numberedDesignation[1]

  const provisionalDesignation = trimmed.match(/^\((.+)\)$/)
  if (provisionalDesignation?.[1]) return provisionalDesignation[1]

  return trimmed
}

function averageDiameterMeters(neo: NeoObject): number {
  return (
    (neo.estimated_diameter.meters.estimated_diameter_min +
      neo.estimated_diameter.meters.estimated_diameter_max) /
    2
  )
}

function toRadarObject(neo: NeoObject): NeoRadarBriefObject | null {
  const approach = neo.close_approach_data[0]
  if (!approach) return null

  return {
    id: neo.id,
    name: formatNeoDisplayName(neo.name),
    date: approach.close_approach_date,
    hazardous: neo.is_potentially_hazardous_asteroid,
    diameterMeters: averageDiameterMeters(neo),
    velocityKmS: parseFloat(approach.relative_velocity.kilometers_per_second),
    missDistanceLd: parseFloat(approach.miss_distance.lunar),
    nasaJplUrl: neo.nasa_jpl_url,
  }
}

function getSizeComparison(diameterMeters: number): string {
  if (diameterMeters < 5) return 'about the size of a compact car'
  if (diameterMeters < 15) return 'about the size of a city bus'
  if (diameterMeters < 30) return 'about the size of a house'
  if (diameterMeters < 60) return 'about the size of a passenger jet'
  if (diameterMeters < 150) return 'roughly football-field scale'
  if (diameterMeters < 300) return 'roughly skyscraper scale'
  if (diameterMeters < 800) return 'roughly stadium scale'
  return 'closer to a small mountain than a city building'
}

function getImpactBand(diameterMeters: number): string {
  if (diameterMeters < 20) return 'a local airburst-scale event'
  if (diameterMeters < 80) return 'a city-scale destructive event'
  if (diameterMeters < 300) return 'a regional catastrophe'
  if (diameterMeters < 1000) return 'a continental-to-global emergency'
  return 'a planetary-scale emergency'
}

function getIllustrativeEnergyMegatons(diameterMeters: number, velocityKmS: number): number | null {
  if (!Number.isFinite(diameterMeters) || !Number.isFinite(velocityKmS)) return null

  const radius = diameterMeters / 2
  const densityKgM3 = 3000
  const massKg = (4 / 3) * Math.PI * radius ** 3 * densityKgM3
  const velocityMS = velocityKmS * 1000
  const energyJoules = 0.5 * massKg * velocityMS ** 2
  const joulesPerMegatonTnt = 4.184e15
  const megatons = energyJoules / joulesPerMegatonTnt
  if (!Number.isFinite(megatons) || megatons <= 0) return null

  if (megatons >= 1000) return Math.round(megatons / 100) * 100
  if (megatons >= 100) return Math.round(megatons / 10) * 10
  return Math.round(megatons)
}

function buildFacts(feed: NeoFeedResult): NeoRadarBriefFacts {
  const allObjects = Object.values(feed.near_earth_objects).flat()
  const dailyEntries = Object.entries(feed.near_earth_objects).map(([date, neos]) => ({
    date,
    count: neos.length,
    hazardousCount: neos.filter((neo) => neo.is_potentially_hazardous_asteroid).length,
  }))

  const radarObjects = allObjects
    .map(toRadarObject)
    .filter((item): item is NeoRadarBriefObject => item !== null)

  if (radarObjects.length === 0 || dailyEntries.length === 0) {
    throw new Error('No asteroid brief data available for this range.')
  }

  const byClosest = [...radarObjects].sort((a, b) => a.missDistanceLd - b.missDistanceLd)
  const byFastest = [...radarObjects].sort((a, b) => b.velocityKmS - a.velocityKmS)
  const byLargest = [...radarObjects].sort((a, b) => b.diameterMeters - a.diameterMeters)
  const hazardousObjects = radarObjects.filter((entry) => entry.hazardous)
  const largestHazardousObject: NeoRadarBriefObject | null =
    hazardousObjects.length > 0
      ? [...hazardousObjects].sort((a, b) => b.diameterMeters - a.diameterMeters)[0]!
      : null
  const impactSubject: NeoRadarBriefObject = largestHazardousObject ?? byLargest[0]!
  const totalObjects = radarObjects.length
  const hazardousCount = hazardousObjects.length
  const busiestDay = [...dailyEntries].sort(
    (a, b) => b.count - a.count || a.date.localeCompare(b.date),
  )[0]!

  return {
    totalObjects,
    hazardousCount,
    observationDays: dailyEntries.length,
    busiestDay,
    closestApproach: byClosest[0]!,
    fastestObject: byFastest[0]!,
    largestObject: byLargest[0]!,
    largestHazardousObject,
    impactSubject,
    impactComparison: getSizeComparison(impactSubject.diameterMeters),
    impactBand: getImpactBand(impactSubject.diameterMeters),
    illustrativeEnergyMegatons: getIllustrativeEnergyMegatons(
      impactSubject.diameterMeters,
      impactSubject.velocityKmS,
    ),
  }
}

function buildFingerprint(facts: NeoRadarBriefFacts): string {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        totalObjects: facts.totalObjects,
        hazardousCount: facts.hazardousCount,
        busiestDay: facts.busiestDay,
        closestApproach: {
          id: facts.closestApproach.id,
          distance: facts.closestApproach.missDistanceLd,
        },
        fastestObject: {
          id: facts.fastestObject.id,
          velocity: facts.fastestObject.velocityKmS,
        },
        largestObject: {
          id: facts.largestObject.id,
          diameter: facts.largestObject.diameterMeters,
        },
        impactSubject: {
          id: facts.impactSubject.id,
          band: facts.impactBand,
          comparison: facts.impactComparison,
          energy: facts.illustrativeEnergyMegatons,
        },
      }),
    )
    .digest('hex')
}

function buildFallbackBrief(
  startDate: string,
  endDate: string,
  facts: NeoRadarBriefFacts,
): NeoRadarBriefResponse {
  const rangeLabel = startDate === endDate ? startDate : `${startDate} to ${endDate}`
  const energyText = facts.illustrativeEnergyMegatons
    ? ` In a simplified rocky-body scenario, that upper-end energy would land in the ${facts.illustrativeEnergyMegatons.toLocaleString()} megaton range.`
    : ''

  return {
    source: 'fallback',
    model: null,
    generatedAt: new Date().toISOString(),
    startDate,
    endDate,
    headline: `Radar brief for ${rangeLabel}`,
    overview: `The current window tracked ${facts.totalObjects} near-Earth objects across ${facts.observationDays} day${facts.observationDays === 1 ? '' : 's'}, with ${facts.hazardousCount} flagged as potentially hazardous. The busiest day was ${facts.busiestDay.date}, when ${facts.busiestDay.count} objects crossed the radar.`,
    impactScenario: `${facts.impactSubject.name} is the most dramatic object in this window, measuring about ${Math.round(facts.impactSubject.diameterMeters)} meters across, ${facts.impactComparison}, and moving at ${facts.impactSubject.velocityKmS.toFixed(1)} km/s. If an object at that scale were on a direct impact path, it would be treated as ${facts.impactBand}.${energyText}`,
    watchNotes: [
      `Closest pass: ${facts.closestApproach.name} slipped by at ${facts.closestApproach.missDistanceLd.toFixed(2)} lunar distances on ${facts.closestApproach.date}.`,
      `Fastest approach: ${facts.fastestObject.name} topped the range at ${facts.fastestObject.velocityKmS.toFixed(1)} km/s.`,
      facts.largestHazardousObject
        ? `Largest hazardous-class object: ${facts.largestHazardousObject.name} at roughly ${Math.round(facts.largestHazardousObject.diameterMeters)} meters.`
        : `No objects in this window were flagged as potentially hazardous, even though the largest body still reached roughly ${Math.round(facts.largestObject.diameterMeters)} meters.`,
    ],
    disclaimer:
      'Illustrative scenario only. NeoWs hazard flags do not mean an impact is expected, and this brief is not a collision forecast.',
    factsUsed: facts,
  }
}

const radarBriefSchema = z.object({
  headline: z.string(),
  overview: z.string(),
  impactScenario: z.string(),
  watchNotes: z.array(z.string()).length(3),
  disclaimer: z.string(),
})

async function generateAiBrief(
  startDate: string,
  endDate: string,
  facts: NeoRadarBriefFacts,
): Promise<NeoRadarBriefContent> {
  if (!openai || !openAiEnabled) {
    throw new Error('OpenAI is not configured')
  }

  const response = await openai.responses.parse({
    model: radarBriefModel,
    store: false,
    max_output_tokens: 420,
    instructions:
      'You write cinematic but scientifically careful asteroid radar briefs. Use only the supplied facts. Never imply a real impact forecast or certainty of collision. Any destruction language must be framed as an illustrative scenario only. Keep the copy vivid, concise, and public-facing. Return valid JSON matching the requested schema.',
    input: JSON.stringify({
      startDate,
      endDate,
      facts,
      writingRules: {
        overview: '2-3 sentences summarizing the selected range.',
        impactScenario: '2 sentences. Exciting, but explicitly hypothetical and illustrative only.',
        watchNotes: 'Exactly 3 short bullet-length strings.',
        disclaimer:
          'One sentence making clear this is not a forecast and hazard flags are not impact predictions.',
      },
    }),
    text: {
      format: zodTextFormat(radarBriefSchema, 'neo_radar_brief'),
    },
  })

  if (response.output_parsed) {
    return response.output_parsed as NeoRadarBriefContent
  }

  const rawText = response.output_text?.trim()
  if (rawText) {
    return radarBriefSchema.parse(JSON.parse(rawText)) as NeoRadarBriefContent
  }

  logger.warn('OpenAI radar brief returned no parsed content', {
    startDate,
    endDate,
    model: radarBriefModel,
    status: response.status,
    incompleteDetails: 'incomplete_details' in response ? response.incomplete_details : undefined,
    output: response.output.map((item) => ({
      type: item.type,
      ...(item.type === 'message'
        ? {
            content: item.content.map((content) => ({
              type: content.type,
              ...(content.type === 'output_text'
                ? {
                    hasText: Boolean(content.text?.trim()),
                    textPreview: content.text?.slice(0, 160) ?? '',
                  }
                : {}),
              ...(content.type === 'refusal'
                ? {
                    refusal: content.refusal,
                  }
                : {}),
            })),
          }
        : {}),
    })),
  })

  throw new Error('OpenAI returned an empty radar brief payload')
}

export async function fetchNeoRadarBrief(
  startDate: string,
  endDate: string,
): Promise<NeoRadarBriefResponse> {
  const durableKey = buildDurableCacheKey(
    'neows',
    'radar-brief',
    `v${RADAR_BRIEF_PROMPT_VERSION}`,
    startDate,
    endDate,
  )
  const inflightKey = `${startDate}:${endDate}`
  const existing = inflightBriefs.get(inflightKey)
  if (existing) return existing

  const promise = (async () => {
    const feed = await fetchNeoFeed(startDate, endDate)
    const facts = buildFacts(feed)
    const fingerprint = buildFingerprint(facts)
    const cached = await durableCache.get<CachedNeoRadarBrief>(durableKey)
    const includesToday = endDate >= todayUTC()

    if (cached) {
      const shouldReuseCached = !includesToday || cached.fingerprint === fingerprint

      if (shouldReuseCached) {
        logger.info('NeoWs radar brief cache hit', { key: durableKey })
        return {
          source: cached.source,
          model: cached.model,
          generatedAt: cached.generatedAt,
          startDate: cached.startDate,
          endDate: cached.endDate,
          headline: cached.headline,
          overview: cached.overview,
          impactScenario: cached.impactScenario,
          watchNotes: cached.watchNotes,
          disclaimer: cached.disclaimer,
          factsUsed: facts,
        }
      }
    }

    let content: NeoRadarBriefContent
    let source: NeoRadarBriefResponse['source'] = 'ai'
    let model: string | null = radarBriefModel

    try {
      content = await generateAiBrief(startDate, endDate, facts)
    } catch (error) {
      logger.warn('NeoWs radar brief AI generation failed, falling back', {
        startDate,
        endDate,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : error,
      })
      const fallback = buildFallbackBrief(startDate, endDate, facts)
      content = {
        headline: fallback.headline,
        overview: fallback.overview,
        impactScenario: fallback.impactScenario,
        watchNotes: fallback.watchNotes,
        disclaimer: fallback.disclaimer,
      }
      source = 'fallback'
      model = null
    }

    const response: NeoRadarBriefResponse = {
      ...content,
      source,
      model,
      generatedAt: new Date().toISOString(),
      startDate,
      endDate,
      factsUsed: facts,
    }

    await durableCache.set(durableKey, {
      ...response,
      promptVersion: RADAR_BRIEF_PROMPT_VERSION,
      fingerprint,
    } satisfies CachedNeoRadarBrief)

    return response
  })()

  inflightBriefs.set(inflightKey, promise)
  const cleanup = () => inflightBriefs.delete(inflightKey)
  promise.then(cleanup, cleanup)
  return promise
}
