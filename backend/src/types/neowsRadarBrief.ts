export interface NeoRadarBriefObject {
  id: string
  name: string
  date: string
  hazardous: boolean
  diameterMeters: number
  velocityKmS: number
  missDistanceLd: number
  nasaJplUrl: string
}

export interface NeoRadarBriefFacts {
  totalObjects: number
  hazardousCount: number
  observationDays: number
  busiestDay: {
    date: string
    count: number
    hazardousCount: number
  }
  closestApproach: NeoRadarBriefObject
  fastestObject: NeoRadarBriefObject
  largestObject: NeoRadarBriefObject
  largestHazardousObject: NeoRadarBriefObject | null
  impactSubject: NeoRadarBriefObject
  impactComparison: string
  impactBand: string
  illustrativeEnergyMegatons: number | null
}

export interface NeoRadarBriefContent {
  headline: string
  overview: string
  impactScenario: string
  watchNotes: string[]
  disclaimer: string
}

export interface NeoRadarBriefResponse extends NeoRadarBriefContent {
  source: 'ai' | 'fallback'
  model: string | null
  generatedAt: string
  startDate: string
  endDate: string
  factsUsed: NeoRadarBriefFacts
}

export interface CachedNeoRadarBrief extends NeoRadarBriefResponse {
  promptVersion: number
  fingerprint: string
}
