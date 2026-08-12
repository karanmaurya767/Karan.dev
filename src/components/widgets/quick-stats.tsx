import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { prefersReducedMotion } from "@/lib/gsap-setup"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useRef } from "react"
import { QUICK_STATS } from "@/lib/content"

/**
 * QuickStats — replaces the token-usage widget with real portfolio stats.
 *
 * Numbers count up 0 → value on mount via GSAP textContent snap.
 * Reduced-motion: final values shown statically.
 */
export function QuickStats() {
  const reduced = useReducedMotion()

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface-card/80 p-4 backdrop-blur">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-[0.14em] text-muted-ink">
          Portfolio · by the numbers
        </div>
        <div className="text-xs text-muted-soft">live</div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {QUICK_STATS.map((stat, i) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} hint={stat.hint} index={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Stat — single stat cell. Animates row fade-up + count-up on mount.
 */
function Stat({
  value,
  label,
  hint,
  index,
}: {
  value: string
  label: string
  hint?: string
  index: number
}) {
  const reduced = useReducedMotion()
  const valueRef = useRef<HTMLDivElement | null>(null)

  // Count-up animation — parse trailing number from value (e.g. "11+" → 11).
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        scope.textContent = value
        return
      }
      // Capture final text so we can settle on it.
      const final = value
      scope.textContent = "0"

      // Try to extract a number for the count-up effect.
      const match = final.match(/(\d+)/)
      if (!match) {
        scope.textContent = final
        return
      }
      const numericTarget = parseInt(match[1], 10)
      const suffix = final.replace(match[1], "")

      const proxy = { v: 0 }
      const tween = gsap.to(proxy, {
        v: numericTarget,
        duration: 1.4,
        ease: "power2.out",
        delay: 0.4 + index * 0.08,
        onUpdate: () => {
          scope.textContent = `${Math.floor(proxy.v)}${suffix}`
        },
        onComplete: () => {
          scope.textContent = final
        },
      })
      return () => {
        tween.kill()
      }
    },
    valueRef,
    [value, reduced, index]
  )

  return (
    <div className="flex flex-col">
      <div
        ref={valueRef}
        className="text-2xl font-medium text-ink"
      >
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.1em] text-muted-ink">
        {label}
      </div>
      {hint && <div className="text-[10px] text-muted-soft">{hint}</div>}
    </div>
  )
}
