export interface NasaImageItem {
  nasa_id: string
  title: string
  description: string
  date_created: string
  media_type: 'image' | 'video' | 'audio'
  center?: string
  keywords?: string[]
  href: string // thumbnail link
  card_url?: string
  asset_manifest_url?: string
}

export interface NasaImageQuery {
  q: string
  media_type?: string
  year_start?: string
  year_end?: string
  page?: number
}
