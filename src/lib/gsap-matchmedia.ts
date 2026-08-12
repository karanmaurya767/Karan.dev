import { useEffect, type DependencyList } from "react"
import { gsap } from "@/lib/gsap-setup"

/**
 * useMatchMedia — responsive GSAP via `gsap.matchMedia()`.
 *
 * Wraps the official pattern so animation setup can branch on viewport
 * breakpoints (`(min-width: 768px)` etc.) inside the hook body. Anything
 * registered through the returned `mm` is automatically reverted on unmount
 * or dep change.
 *
 * Usage:
 *   useMatchMedia(({ isDesktop, isMobile, mm }) => {
 *     mm.add("(min-width: 1024px)", () => {
 *       gsap.to(el, { x: 100, scrollTrigger: { ... } })
 *     })
 *     mm.add("(max-width: 1023px)", () => {
 *       gsap.set(el, { x: 0 })
 *     })
 *   }, [deps])
 *
 * Mirrors the official GSAP React hook, simplified for our needs.
 */
export function useMatchMedia(
  setup: (helpers: {
    mm: gsap.MatchMedia
    isDesktop: boolean
    isMobile: boolean
    isReducedMotion: boolean
  }) => void,
  deps: DependencyList = []
): void {
  useEffect(() => {
    const mm = gsap.matchMedia()
    setup({
      mm,
      // Sensible defaults — `mm.add(cond, fn)` is the source of truth for
      // branch behaviour. These flags just let the caller early-out before
      // registering a tween if a hard-coded assumption breaks.
      isDesktop: typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
      isMobile: typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
      isReducedMotion:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    })
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
