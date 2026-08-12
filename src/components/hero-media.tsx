import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * HeroMedia — two persistent background videos crossfaded by GSAP.
 *
 * Premium additions:
 *   - Brief white flash overlay on mode change (60ms).
 *   - Vignette pulse on mode change.
 *
 * Honors prefers-reduced-motion: snap-cut, no flash.
 */
export function HeroMedia({
  mode,
  daySrc,
  dayPoster,
  nightSrc,
  nightPoster,
}: {
  mode: "day" | "night"
  daySrc: string
  dayPoster: string
  nightSrc: string
  nightPoster: string
}) {
  const reduced = useReducedMotion()
  const dayRef = useRef<HTMLVideoElement | null>(null)
  const nightRef = useRef<HTMLVideoElement | null>(null)
  const flashRef = useRef<HTMLDivElement | null>(null)
  const vignetteRef = useRef<HTMLDivElement | null>(null)

  // Mount: snap the active video visible, hide the other.
  useEffect(() => {
    if (!dayRef.current || !nightRef.current) return
    gsap.set(dayRef.current, { opacity: mode === "day" ? 1 : 0 })
    gsap.set(nightRef.current, { opacity: mode === "night" ? 1 : 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mode change: crossfade + flash + vignette pulse.
  useEffect(() => {
    if (!dayRef.current || !nightRef.current) return

    const active = mode === "day" ? dayRef.current : nightRef.current
    const inactive = mode === "day" ? nightRef.current : dayRef.current

    active.play().catch(() => {
      /* autoplay blocked — fallback is fine */
    })
    inactive.pause()

    if (reduced) {
      gsap.set(active, { opacity: 1 })
      gsap.set(inactive, { opacity: 0 })
      return
    }

    gsap.killTweensOf([active, inactive])
    gsap.fromTo(
      active,
      { opacity: 0 },
      { opacity: 1, duration: DUR.slow, ease: EASE.inOut }
    )
    gsap.fromTo(
      inactive,
      { opacity: 1 },
      { opacity: 0, duration: DUR.slow, ease: EASE.inOut }
    )

    // Flash overlay — 60ms white pop.
    if (flashRef.current) {
      gsap.killTweensOf(flashRef.current)
      gsap.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.35, duration: 0.06, ease: "power2.out", yoyo: true, repeat: 1 }
      )
    }

    // Vignette pulse — a soft dark ring contracts outward.
    if (vignetteRef.current) {
      gsap.killTweensOf(vignetteRef.current)
      gsap.fromTo(
        vignetteRef.current,
        { opacity: 0, scale: 0.6 },
        {
          opacity: 0.6,
          scale: 1.4,
          duration: DUR.slow,
          ease: EASE.out,
        }
      )
      gsap.to(vignetteRef.current, {
        opacity: 0,
        duration: 0.5,
        delay: DUR.slow - 0.2,
        ease: EASE.out,
      })
    }
  }, [mode, reduced])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        ref={dayRef}
        src={daySrc}
        poster={dayPoster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: mode === "day" ? 1 : 0 }}
      />
      <video
        ref={nightRef}
        src={nightSrc}
        poster={nightPoster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: mode === "night" ? 1 : 0 }}
      />
      {/* Multi-stop scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-overlay-ink/30 via-overlay-ink/10 to-overlay-ink/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,78,0,0.06),transparent_55%)]" />
      {/* Vignette pulse overlay */}
      <div
        ref={vignetteRef}
        aria-hidden
        className="absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 80%)",
          transformOrigin: "center center",
        }}
      />
      {/* Flash overlay */}
      <div
        ref={flashRef}
        aria-hidden
        className="absolute inset-0 bg-white opacity-0 mix-blend-screen"
      />
    </div>
  )
}
