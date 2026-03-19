import { Image as ImageIcon, Play, Search, Shapes } from 'lucide-react'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import {
  nasaImageEmptyDescription,
  nasaImageEmptyTitle,
  nasaImageIntro,
  nasaImagePopularSearchLabel,
  nasaImageSuggestions,
} from '@/content/nasaImageContent'

export default function NasaImageRouteSkeleton() {
  return (
    <>
      <div className="mb-8">
        <p className="max-w-4xl text-base leading-8 text-slate-500 dark:text-slate-400">
          {nasaImageIntro}
        </p>
      </div>

      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/55 dark:shadow-[0_20px_60px_rgba(2,6,23,0.3)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Search
            </label>
            <div className="relative w-full">
              <input
                type="text"
                disabled
                placeholder="e.g. nebula, apollo 11, saturn..."
                className="h-12 w-full min-w-50 rounded-2xl border border-slate-200 bg-white/90 px-4 pr-11 text-base text-slate-700 opacity-80 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Media
            </label>
            <SegmentedControl
              legend="Filter by media type"
              value="all"
              onChange={() => {}}
              options={[
                { value: 'all', label: 'All', icon: <Shapes size={14} /> },
                { value: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                { value: 'video', label: 'Video', icon: <Play size={14} /> },
              ]}
              className="pointer-events-none"
            />
          </div>

          <button
            type="button"
            disabled
            className="cosmic-btn-primary flex h-12 items-center justify-center gap-1.5 rounded-2xl px-5 text-sm font-medium opacity-70"
          >
            <Search size={14} />
            Search
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/60 px-6 py-12 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/35 dark:shadow-none">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            {nasaImageEmptyTitle}
          </p>
          <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
            {nasaImageEmptyDescription}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {nasaImagePopularSearchLabel}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {nasaImageSuggestions.map((suggestion) => (
              <FilterChipButton
                key={suggestion.query}
                onClick={() => {}}
                className="pointer-events-none"
              >
                {suggestion.label}
              </FilterChipButton>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
