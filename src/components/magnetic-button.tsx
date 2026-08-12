import { useEffect } from "react"
import { gsap } from "@/lib/gsap-setup"
import { EASE } from "@/lib/gsap-utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * MagneticButtons — wires up cursor-following translation + scale on every
 * element marked with `data-magnetic`.
 *
 * Behaviour:
 *   - On `lg+` viewports, the element shifts up to ~12px toward the cursor
 *     (scaled by the inverse of the element's half-width / half-height).
 *   - When the cursor leaves, the element springs back to its origin with
 *     an elastic ease.
 *   - On `md` and below, no-op — magnetic interactions are touch-incompatible.
 *   - Honors `prefers-reduced-motion: reduce` — no-op.
 *
 * Per-element tuning:
 *   - `data-magnetic="strong"` → pulls harder (maxOffset: 18).
 *   - `data-magnetic="subtle"` → pulls less (maxOffset: 6).
 *
 * Implementation notes:
 *   - We use `gsap.quickTo` for low-overhead cursor tracking on the X/Y axis.
 *   - Scale-up tweens are added separately so they don't fight the translate.
 *   - The component itself renders `null` — it just adds global listeners.
 */
export function MagneticButtons() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(max-width: 1023px)").matches) return

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-magnetic]")
    )
    if (targets.length === 0) return

    const cleanups: Array<() => void> = []

    for (const el of targets) {
      // Per-element strength override via attribute value.
      const attr = el.getAttribute("data-magnetic")
      let maxOffset = 12
      let scaleTarget = 1.04
      if (attr === "strong") {
        maxOffset = 18
        scaleTarget = 1.06
      } else if (attr === "subtle") {
        maxOffset = 6
        scaleTarget = 1.02
      }

      // Translate tweens.
      const setX = gsap.quickTo(el, "x", {
        duration: 0.4,
        ease: EASE.out,
      })
      const setY = gsap.quickTo(el, "y", {
        duration: 0.4,
        ease: EASE.out,
      })

      // Spring-back tweens (slightly longer + elastic).
      const toX = gsap.quickTo(el, "x", {
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      })
      const toY = gsap.quickTo(el, "y", {
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      })

      // Scale tweens (separate so they don't fight translate).
      const setScale = gsap.quickTo(el, "scale", {
        duration: 0.4,
        ease: EASE.out,
      })
      const toScale = gsap.quickTo(el, "scale", {
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      })

      function onMove(e: PointerEvent) {
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        // Normalize strength so small buttons don't lurch off screen.
        const strength = 0.35
        const dx = (e.clientX - cx) * strength
        const dy = (e.clientY - cy) * strength
        // Cap so we never travel past the configured maximum.
        const ax = Math.max(-maxOffset, Math.min(maxOffset, dx))
        const ay = Math.max(-maxOffset, Math.min(maxOffset, dy))
        setX(ax)
        setY(ay)
        setScale(scaleTarget)
      }

      function onLeave() {
        toX(0)
        toY(0)
        toScale(1)
      }

      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerleave", onLeave)

      cleanups.push(() => {
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerleave", onLeave)
        // Snap back on unmount.
        gsap.set(el, { x: 0, y: 0, scale: 1 })
      })
    }

    return () => {
      cleanups.forEach((fn) => fn())
    }
  }, [reduced])

  return null
}
