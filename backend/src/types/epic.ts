export interface EpicImage {
  identifier: string
  caption: string
  image: string
  card_url?: string
  date: string
  centroid_coordinates: {
    lat: number
    lon: number
  }
}

export type EpicCollection = 'natural' | 'enhanced'
