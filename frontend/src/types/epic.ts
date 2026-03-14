export interface EpicImage {
  identifier: string
  caption: string
  image: string
  date: string
  centroid_coordinates: {
    lat: number
    lon: number
  }
}

export type EpicCollection = 'natural' | 'enhanced'
