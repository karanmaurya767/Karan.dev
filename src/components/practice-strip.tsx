import { PRACTICE_AREAS } from "@/lib/content"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useEffect, useRef } from "react"

/**
 * PracticeStrip — horizontally auto-scrolling band of practice areas.
 *
 * Three layered animations:
 *   1. Continuous right-to-left drift via `gsap.to` with `repeat: -1`.
 *   2. Scroll-velocity modulation — `timeScale` scales with scroll speed
 *      so the marquee feels alive when the user scrolls.
 *   3. Per-item hover: number color → primary, hairline expands 1 → 2.5x.
 *
 * The strip duplicate-then-mod-mask trick keeps the loop seamless without
 * any visible snap when the first copy exits stage left.
 *
 * Honors `prefers-reduced-motion` — renders a static grid instead.
 */
export function PracticeStrip() {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement | null>(null)
  const looped = [...PRACTICE_AREAS, ...PRACTICE_AREAS, ...PRACTICE_AREAS]

  // Continuous marquee tween — gentle pace, scroll-responsive.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const half = scope.scrollWidth / 3
      gsap.to(scope, {
        x: -half,
        duration: half * 0.05, // ~20 px/sec — calm pace
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % -half),
        },
      })
    },
    trackRef,
    []
  )

  // Scroll-velocity modulation. Reads the average velocity from the last
  // ~120ms of scroll events and scales the marquee `timeScale` accordingly.
  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    if (!track) return
    let lastY = window.scrollY
    let lastT = performance.now()
    let raf = 0
    let smoothedSpeed = 0

    const tween = gsap.getTweensOf(track)[0] as gsap.core.Tween | undefined
    if (tween) {
      tween.timeScale(0.8)
    }

    function tick() {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(1, now - lastT)
      const dy = y - lastY
      // px / ms — clamp to [-2, 2] so the scale doesn't go wild.
      const instant = Math.max(-2, Math.min(2, dy / dt))
      // EMA smooth so the response feels organic, not jittery.
      smoothedSpeed = smoothedSpeed * 0.7 + instant * 0.3
      if (tween) {
        const ts = 0.8 + Math.abs(smoothedSpeed) * 8
        tween.timeScale(ts)
      }
      lastY = y
      lastT = now
      raf = 0
    }

    function onScroll() {
      if (raf) return
      raf = window.requestAnimationFrame(tick)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.cancelAnimationFrame(raf)
      if (tween) tween.timeScale(1)
    }
  }, [reduced])

  // Reduced-motion fallback: a static grid.
  if (reduced) {
    return (
      <section
        aria-label="Practice areas"
        className="relative border-y border-hairline bg-canvas-soft"
      >
        <div
          className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-3 lg:grid-cols-5 lg:px-10"
        >
          {PRACTICE_AREAS.map((p) => (
            <PracticeItem key={p.k} k={p.k} v={p.v} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Practice areas"
      className="relative overflow-hidden border-y border-hairline bg-canvas-soft"
    >
      {/* Soft edge fades so items don't slam into the viewport edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas-soft to-transparent sm:w-24"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas-soft to-transparent sm:w-24"
      />

      <div
        ref={trackRef}
        className="flex w-max gap-12 px-6 py-6 will-change-transform lg:gap-14 lg:px-10"
      >
        {looped.map((p, i) => (
          <PracticeItem key={`${p.k}-${i}`} k={p.k} v={p.v} />
        ))}
      </div>
    </section>
  )
}

/**
 * PracticeItem — single row with hover state + counter animation.
 */
function PracticeItem({
  k,
  v,
}: {
  k: string
  v: string
}) {
  const reduced = useReducedMotion()
  const numRef = useRef<HTMLSpanElement | null>(null)
  const lineRef = useRef<HTMLSpanElement | null>(null)
  const rowRef = useRef<HTMLDivElement | null>(null)

  // Number counter animation: 00 → k (e.g. "01").
  useGSAPContextOnRef<HTMLSpanElement>(
    ({ scope }) => {
      if (reduced) {
        scope.textContent = k
        return
      }
      gsap.fromTo(
        scope,
        { textContent: "00" },
        {
          textContent: parseInt(k, 10),
          duration: 1.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: scope,
            start: "top 92%",
            once: true,
          },
        }
      )
    },
    numRef,
    [k, reduced]
  )

  // Hover micro-interaction — number color + line expansion.
  useEffect(() => {
    if (reduced) return
    const row = rowRef.current
    const num = numRef.current
    const line = lineRef.current
    if (!row || !num || !line) return

    function onEnter() {
      gsap.to(num, { color: "var(--primary)", duration: 0.3, ease: EASE.out })
      gsap.to(line, {
        scaleX: 2.5,
        duration: 0.4,
        ease: EASE.out,
        transformOrigin: "left center",
      })
    }
    function onLeave() {
      gsap.to(num, { color: "", duration: 0.3, ease: EASE.out })
      gsap.to(line, {
        scaleX: 1,
        duration: 0.4,
        ease: EASE.out,
        transformOrigin: "left center",
      })
    }
    row.addEventListener("mouseenter", onEnter)
    row.addEventListener("mouseleave", onLeave)
    return () => {
      row.removeEventListener("mouseenter", onEnter)
      row.removeEventListener("mouseleave", onLeave)
    }
  }, [reduced])

  return (
    <div
      ref={rowRef}
      className="group flex items-baseline gap-3 whitespace-nowrap"
    >
      <span
        ref={numRef}
        data-practice-num
        className="font-mono text-xs text-muted-soft transition-colors"
      >
        00
      </span>
      <span
        ref={lineRef}
        data-practice-line
        aria-hidden
        className="h-px w-4 origin-left bg-hairline-strong"
        style={{ transform: "scaleX(0)" }}
      />
      <span data-practice-label className="text-sm text-ink">
        {v}
      </span>
    </div>
  )
}
