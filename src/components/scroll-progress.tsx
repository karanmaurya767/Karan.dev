import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap-setup"
import { EASE } from "@/lib/gsap-utils"
import { useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * ScrollProgress — fixed bar at the top of the viewport that scales from
 * 0 → 1 as the user scrolls from top to bottom of the document.
 *
 * Premium additions:
 *   - Bar height grows 2px → 3px while actively scrolling.
 *   - Gradient from primary (left) → transparent (right) so the bar feels
 *     alive and tracks scroll velocity visually.
 *   - A thin leading-edge highlight (4px) leads the bar.
 *
 * Honors `prefers-reduced-motion: reduce` — full-width static bar.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion()
  const barRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isScrollingRef = useRef(false)

  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { scaleX: 1 })
        return
      }
      gsap.fromTo(
        scope,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          ease: EASE.out,
          transformOrigin: "left center",
          scrollTrigger: {
            start: 0,
            end: () =>
              document.documentElement.scrollHeight - window.innerHeight,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        }
      )
    },
    barRef,
    [reduced]
  )

  // Bar height pulse while scrolling — 2px → 3px.
  useEffect(() => {
    if (reduced) return
    if (typeof window === "undefined") return
    const container = containerRef.current
    if (!container) return

    let timer: number | null = null
    function onScroll() {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true
        gsap.to(container, {
          height: 3,
          duration: 0.2,
          ease: EASE.out,
        })
      }
      if (timer !== null) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        isScrollingRef.current = false
        gsap.to(container, {
          height: 2,
          duration: 0.4,
          ease: EASE.out,
        })
      }, 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [reduced])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] overflow-hidden bg-transparent"
    >
      {/* Gradient bar — fades primary → transparent over the leading 30%. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--primary) 0%, var(--primary) 70%, rgba(245, 78, 0, 0) 100%)",
        }}
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      {/* Leading-edge highlight — small bright dot. */}
      <div
        className="absolute left-0 top-0 h-full w-1 origin-left bg-primary"
        style={{
          boxShadow: "0 0 8px 2px rgba(245, 78, 0, 0.6)",
          animation: "scrollprogress-pulse 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes scrollprogress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
