export interface NasaImageItem {
  nasa_id: string
  title: string
  description: string
  date_created: string
  media_type: 'image' | 'video' | 'audio'
  center?: string
  keywords?: string[]
  href: string
  asset_manifest_url?: string
}
