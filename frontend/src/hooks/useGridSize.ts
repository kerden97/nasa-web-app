import { useEffect, useState } from 'react'

/**
 * Returns responsive page size for load-more based on grid columns.
 * Initial load always fetches 21 (hardcoded, no client detection delay).
 * Load-more adapts to viewport so each batch remains reasonable for the current layout:
 *   - small screens: 8 per batch
 *   - tablet:       12 per batch
 *   - desktop:      20 per batch
 */

interface GridSize {
  cols: number
  pageSize: number
}

const BREAKPOINTS: { minWidth: number; cols: number; pageSize: number }[] = [
  { minWidth: 1024, cols: 4, pageSize: 20 },
  { minWidth: 768, cols: 3, pageSize: 12 },
  { minWidth: 640, cols: 2, pageSize: 8 },
  { minWidth: 0, cols: 1, pageSize: 8 },
]

function resolve(width: number): GridSize {
  const bp = BREAKPOINTS.find((b) => width >= b.minWidth)!
  return { cols: bp.cols, pageSize: bp.pageSize }
}

export function useGridSize(): GridSize {
  const [size, setSize] = useState(() =>
    resolve(typeof window !== 'undefined' ? window.innerWidth : 1024),
  )

  useEffect(() => {
    let prev = size.cols
    function onResize() {
      const next = resolve(window.innerWidth)
      if (next.cols !== prev) {
        prev = next.cols
        setSize(next)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [size.cols])

  return size
}
