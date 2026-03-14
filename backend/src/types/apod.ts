export interface ApodItem {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
  thumbnail_url?: string
  service_version: string
}

export interface ApodQuery {
  date?: string
  start_date?: string
  end_date?: string
  count?: number
}
