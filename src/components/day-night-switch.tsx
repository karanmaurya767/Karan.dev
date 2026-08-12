import { useEffect, useRef, useState } from "react"
import { Moon, Sun } from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import { EASE } from "@/lib/gsap-utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * DayNightSwitch — the signature hero toggle.
 *
 * Premium additions:
 *   - Sun/moon icon rotates 360° on each toggle.
 *   - Existing thumb slide with elastic ease preserved.
 */
export function DayNightSwitch({
  variant = "sun",
  onChange,
}: {
  variant?: "sun" | "moon"
  onChange?: (next: "sun" | "moon") => void
}) {
  const [mode, setMode] = useState<"sun" | "moon">(variant)
  const reduced = useReducedMotion()
  const thumbRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    setMode(variant)
  }, [variant])

  // Mount-only: lock the thumb to its starting position.
  useEffect(() => {
    if (!thumbRef.current) return
    gsap.set(thumbRef.current, { left: variant === "sun" ? 4 : 44 })
    if (iconRef.current) gsap.set(iconRef.current, { rotation: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate the thumb + icon rotation whenever mode flips.
  useEffect(() => {
    if (!thumbRef.current) return
    const target = mode === "sun" ? 4 : 44
    if (reduced) {
      gsap.set(thumbRef.current, { left: target })
      if (iconRef.current) gsap.set(iconRef.current, { rotation: 0 })
      return
    }
    gsap.killTweensOf([thumbRef.current, iconRef.current])
    gsap.fromTo(
      thumbRef.current,
      { left: mode === "sun" ? 44 : 4 },
      { left: target, duration: 0.6, ease: EASE.elastic }
    )
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotation: 0 },
        { rotation: 360, duration: 0.7, ease: EASE.out, transformOrigin: "50% 50%" }
      )
    }
  }, [mode, reduced])

  function toggle() {
    const next = mode === "sun" ? "moon" : "sun"
    setMode(next)
    onChange?.(next)
  }

  const isSun = mode === "sun"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isSun ? "Switch to night" : "Switch to day"}
      aria-pressed={!isSun}
      className="group relative inline-flex h-10 w-[88px] items-center rounded-full border border-hairline-strong bg-surface-card/90 px-1 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur transition-colors hover:bg-surface-card"
    >
      <span
        ref={thumbRef}
        aria-hidden
        className="absolute top-1 bottom-1 w-9 rounded-full bg-canvas ring-1 ring-hairline-strong"
      >
        <span
          ref={iconRef}
          className="absolute inset-0 flex items-center justify-center text-ink"
        >
          {isSun ? (
            <Sun size={16} weight="duotone" />
          ) : (
            <Moon size={16} weight="duotone" />
          )}
        </span>
      </span>

      <span className="sr-only">Toggle day/night hero</span>
    </button>
  )
}
