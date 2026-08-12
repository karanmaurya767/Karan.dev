/**
 * GSAP setup — register plugins once and expose a SSR-safe reduced-motion gate.
 *
 * Free plugins only (ScrollTrigger, ScrollToPlugin). Paid plugins (SplitText,
 * MorphSVG, etc.) are intentionally NOT registered — they require a Club
 * GreenSock license. When a license is added, uncomment the matching
 * `.registerPlugin(...)` line below.
 */

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
// import { MotionPathPlugin } from "gsap/MotionPathPlugin"
// import { FlipPlugin } from "gsap/FlipPlugin"
// import { TextPlugin } from "gsap/TextPlugin"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
  // gsap.registerPlugin(MotionPathPlugin)
  // gsap.registerPlugin(FlipPlugin)
  // gsap.registerPlugin(TextPlugin)

  // Keep the dev console quiet — our animations are scoped, so null targets
  // are intentional (e.g. when a section is conditionally rendered).
  gsap.config({ nullTargetWarn: false })
}

/**
 * SSR-safe `prefers-reduced-motion` check.
 *
 * Returns `false` during server rendering so the initial paint isn't blocked.
 * On the client, reads the live media-query state — GSAP's `matchMedia` will
 * pick up live changes automatically when consumers wire it through.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export { gsap, ScrollTrigger, ScrollToPlugin }
