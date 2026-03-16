import { useEffect, useRef } from 'react'
import { useMotion } from '@/context/useMotion'

interface StarfieldProps {
  className?: string
}

export default function Starfield({
  className = 'pointer-events-none fixed inset-0 z-0',
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<
    Array<{
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      twinkleSpeed: number
    }>
  >([])
  const { starsPaused } = useMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile =
      window.matchMedia('(max-width: 640px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    const starCount = isMobile ? 120 : 300
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5)

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * pixelRatio)
      canvas.height = Math.floor(window.innerHeight * pixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    if (starsRef.current.length === 0) {
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.4 + 0.05,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      }))
    }

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      starsRef.current.forEach((star) => {
        if (!starsPaused) {
          star.opacity += star.twinkleSpeed
          if (star.opacity > 1 || star.opacity < 0.1) {
            star.twinkleSpeed *= -1
          }
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity})`
        ctx.fill()

        if (!starsPaused) {
          star.y += star.speed
          if (star.y > window.innerHeight) {
            star.y = 0
            star.x = Math.random() * window.innerWidth
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [starsPaused])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
