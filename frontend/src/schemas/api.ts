import { z } from 'zod'

export const apiErrorBodySchema = z.object({
  error: z.unknown().optional(),
  code: z.unknown().optional(),
  status: z.unknown().optional(),
})

export const apodMediaTypeSchema = z.enum(['image', 'video'])

export const apodItemSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  url: z.string(),
  hdurl: z.string().optional(),
  hero_url: z.string().optional(),
  card_url: z.string().optional(),
  media_type: apodMediaTypeSchema,
  copyright: z.string().optional(),
  thumbnail_url: z.string().optional(),
  service_version: z.string().optional(),
})

export const apodItemsSchema = z.array(apodItemSchema)
export const apodResponseSchema = z.union([apodItemSchema, apodItemsSchema])
export const apodLatestCacheSchema = z.object({
  items: apodItemsSchema,
  oldestDate: z.string().nullable(),
  hasMore: z.boolean(),
})

export const epicCollectionSchema = z.enum(['natural', 'enhanced'])
export const epicImageSchema = z.object({
  identifier: z.string(),
  caption: z.string(),
  image: z.string(),
  date: z.string(),
  centroid_coordinates: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
})
export const epicImagesSchema = z.array(epicImageSchema)
export const epicDatesSchema = z.array(z.string())

export const nasaMediaTypeSchema = z.enum(['image', 'video', 'audio'])
export const nasaImageItemSchema = z.object({
  nasa_id: z.string(),
  title: z.string(),
  description: z.string(),
  date_created: z.string(),
  media_type: nasaMediaTypeSchema,
  center: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  href: z.string(),
  asset_manifest_url: z.string().optional(),
})
export const nasaImageSearchResultSchema = z.object({
  items: z.array(nasaImageItemSchema),
  totalHits: z.number().int().nonnegative(),
})

export const neoCloseApproachSchema = z.object({
  close_approach_date: z.string(),
  close_approach_date_full: z.string(),
  epoch_date_close_approach: z.number(),
  relative_velocity: z.object({
    kilometers_per_second: z.string(),
    kilometers_per_hour: z.string(),
    miles_per_hour: z.string(),
  }),
  miss_distance: z.object({
    astronomical: z.string(),
    lunar: z.string(),
    kilometers: z.string(),
    miles: z.string(),
  }),
  orbiting_body: z.string(),
})

const estimatedDiameterRangeSchema = z.object({
  estimated_diameter_min: z.number(),
  estimated_diameter_max: z.number(),
})

export const neoObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  nasa_jpl_url: z.string(),
  absolute_magnitude_h: z.number(),
  estimated_diameter: z.object({
    kilometers: estimatedDiameterRangeSchema,
    meters: estimatedDiameterRangeSchema,
  }),
  is_potentially_hazardous_asteroid: z.boolean(),
  close_approach_data: z.array(neoCloseApproachSchema),
  is_sentry_object: z.boolean(),
})

export const neoFeedResultSchema = z.object({
  element_count: z.number().int().nonnegative(),
  near_earth_objects: z.record(z.string(), z.array(neoObjectSchema)),
})

export const neoRadarBriefSourceSchema = z.enum(['ai', 'fallback'])
export const neoRadarBriefObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  hazardous: z.boolean(),
  diameterMeters: z.number(),
  velocityKmS: z.number(),
  missDistanceLd: z.number(),
  nasaJplUrl: z.string(),
})

export const neoRadarBriefFactsSchema = z.object({
  totalObjects: z.number().int().nonnegative(),
  hazardousCount: z.number().int().nonnegative(),
  observationDays: z.number().int().positive(),
  busiestDay: z.object({
    date: z.string(),
    count: z.number().int().nonnegative(),
    hazardousCount: z.number().int().nonnegative(),
  }),
  closestApproach: neoRadarBriefObjectSchema,
  fastestObject: neoRadarBriefObjectSchema,
  largestObject: neoRadarBriefObjectSchema,
  largestHazardousObject: neoRadarBriefObjectSchema.nullable(),
  impactSubject: neoRadarBriefObjectSchema,
  impactComparison: z.string(),
  impactBand: z.string(),
  illustrativeEnergyMegatons: z.number().nullable(),
})

export const neoRadarBriefResponseSchema = z.object({
  source: neoRadarBriefSourceSchema,
  model: z.string().nullable(),
  generatedAt: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  headline: z.string(),
  overview: z.string(),
  impactScenario: z.string(),
  watchNotes: z.array(z.string()),
  disclaimer: z.string(),
  factsUsed: neoRadarBriefFactsSchema,
})

export function persistedCacheRecordSchema<TSchema extends z.ZodTypeAny>(valueSchema: TSchema) {
  return z.object({
    savedAt: z.number(),
    value: valueSchema,
  })
}

export type ApodItem = z.infer<typeof apodItemSchema>
export type ApodLatestCache = z.infer<typeof apodLatestCacheSchema>
export type EpicCollection = z.infer<typeof epicCollectionSchema>
export type EpicImage = z.infer<typeof epicImageSchema>
export type NasaImageItem = z.infer<typeof nasaImageItemSchema>
export type NeoCloseApproach = z.infer<typeof neoCloseApproachSchema>
export type NeoObject = z.infer<typeof neoObjectSchema>
export type NeoFeedResult = z.infer<typeof neoFeedResultSchema>
export type NeoRadarBriefObject = z.infer<typeof neoRadarBriefObjectSchema>
export type NeoRadarBriefFacts = z.infer<typeof neoRadarBriefFactsSchema>
export type NeoRadarBriefResponse = z.infer<typeof neoRadarBriefResponseSchema>
