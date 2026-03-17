import { AudioLines, Image as ImageIcon, Play } from 'lucide-react'

interface MediaBadgeProps {
  kind: string
  className?: string
  cardStyle?: boolean
}

export default function MediaBadge({ kind, className = '', cardStyle = false }: MediaBadgeProps) {
  const normalizedKind = kind.toLowerCase()
  const toneClass =
    normalizedKind === 'video'
      ? 'cosmic-pill-media--video'
      : normalizedKind === 'audio'
        ? 'cosmic-pill-media--audio'
        : 'cosmic-pill-media--image'

  const Icon =
    normalizedKind === 'video' ? Play : normalizedKind === 'audio' ? AudioLines : ImageIcon

  return (
    <span
      className={`cosmic-pill-media ${toneClass} ${cardStyle ? 'cosmic-card-badge' : 'px-3 py-1.5 text-xs font-medium tracking-[0.12em]'} inline-flex items-center gap-1.5 rounded-full uppercase leading-none ${className}`.trim()}
    >
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <Icon size={cardStyle ? 11 : 12} strokeWidth={2.1} />
      </span>
      <span className="block translate-y-[0.5px]">{kind}</span>
    </span>
  )
}
