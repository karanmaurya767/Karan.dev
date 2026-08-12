import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/gsap-setup"
import { EASE } from "@/lib/gsap-utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SITE } from "@/lib/content"

/**
 * PageLoader — full-viewport preloader shown on initial website load.
 *
 * Premium touches:
 *   - Letter-spacing + opacity tween on the brand mark so it feels like
 *     a quiet lockup arriving rather than a hard fade.
 *   - Progress percentage counts 0 → 100% while the document loads
 *     (driven by document.readyState + a fallback interval that simulates
 *     progress in case the page is heavy on network).
 *   - Bottom hairline grows in left-to-right as progress advances.
 *   - One final sweep — the whole panel slides up + fades out via clip-mask
 *     so the reveal feels like a curtain going up.
 *
 *  Honors `prefers-reduced-motion: reduce` — instant render, instant dismiss.
 *
 * Self-dismisses on `window.onload` (or after a hard cap of 4s) by lifting
 * the curtain. The element stays in the DOM but with `pointer-events: none`
 * so it can't intercept clicks.
 */
export function PageLoader() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const brandRef = useRef<HTMLSpanElement | null>(null)
  const dotRef = useRef<HTMLSpanElement | null>(null)
  const underlineRef = useRef<HTMLSpanElement | null>(null)
  const progressNumRef = useRef<HTMLSpanElement | null>(null)
  const progressTrackRef = useRef<HTMLDivElement | null>(null)
  const progressFillRef = useRef<HTMLDivElement | null>(null)
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const dismissedRef = useRef(false)

  // Progress ticker — runs from 0 to 100 in roughly 1.8s, then waits for
  // window.load to dismiss. We use both document.readyState and a simulated
  // counter so the bar feels alive even on fast cached loads.
  useEffect(() => {
    if (typeof window === "undefined") return

    let simulated = 0
    const simInterval = window.setInterval(() => {
      // Smooth ease-out from 0 → 100 in ~1.8s, but slow down near the end
      // so the bar holds at ~95% until the real load event completes.
      simulated = Math.min(95, simulated + 5 + simulated * 0.08)
      const real = readynessToProgress()
      const next = Math.max(simulated, real)
      setProgress(Math.round(next))
    }, 90)

    function onLoad() {
      setProgress(100)
      // Tiny beat so users see the bar reach 100 before the curtain goes up.
      window.setTimeout(() => dismiss(), 220)
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad, { once: true })
    }

    // Hard cap — never block past 4s.
    const cap = window.setTimeout(() => {
      setProgress(100)
      dismiss()
    }, 4000)

    return () => {
      window.clearInterval(simInterval)
      window.clearTimeout(cap)
      window.removeEventListener("load", onLoad)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate the progress number and fill bar whenever `progress` changes.
  useEffect(() => {
    if (reduced) return
    const fill = progressFillRef.current
    const num = progressNumRef.current
    if (fill) {
      gsap.to(fill, {
        scaleX: progress / 100,
        transformOrigin: "left center",
        duration: 0.4,
        ease: EASE.out,
        overwrite: "auto",
      })
    }
    if (num) {
      gsap.to(num, {
        duration: 0.35,
        ease: "power2.out",
        onUpdate: () => {
          // Snap the displayed number to the latest integer so it feels
          // like a counter, not a tween.
          num.textContent = String(Math.round(progress)).padStart(3, "0")
        },
        overwrite: "auto",
      })
    }
  }, [progress, reduced])

  // Run the entrance animation after first paint.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (reduced) return
    const brand = brandRef.current
    const dot = dotRef.current
    const underline = underlineRef.current
    if (!brand || !underline) return

    // Brand — letter-spacing tights + opacity in.
    gsap.fromTo(
      brand,
      { letterSpacing: "0.6em", opacity: 0 },
      { letterSpacing: "0.18em", opacity: 1, duration: 1.2, ease: EASE.out }
    )
    if (dot) {
      gsap.fromTo(
        dot,
        { scale: 0 },
        { scale: 1, duration: 0.6, ease: EASE.back, delay: 0.15 }
      )
      // Continuous pulse.
      gsap.to(dot, {
        scale: 1.35,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.8,
        transformOrigin: "50% 50%",
      })
    }
    gsap.fromTo(
      underline,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 1.0, ease: EASE.out, delay: 0.5 }
    )
  }, [reduced])

  function dismiss() {
    if (dismissedRef.current) return
    dismissedRef.current = true
    const root = rootRef.current
    const curtain = curtainRef.current
    if (!root || !curtain) {
      setHidden(true)
      return
    }

    if (reduced) {
      gsap.set(root, { display: "none" })
      setHidden(true)
      return
    }

    // Curtain reveal — the panel's clip-mask wipes bottom-to-top, leaving
    // the page visible underneath. The whole root fades out at the end so
    // any pointer-events:none transition is clean.
    const tl = gsap.timeline({
      onComplete: () => {
        if (root) gsap.set(root, { display: "none" })
        setHidden(true)
      },
    })
    tl.to(curtain, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.9,
      ease: EASE.inOut,
    })
    tl.to(
      root,
      { opacity: 0, duration: 0.2, ease: "power2.out" },
      "-=0.2"
    )
  }

  if (hidden) return null

  return (
    <div
      ref={rootRef}
      aria-hidden={hidden}
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      {/* Curtain — the actual visible overlay that wipes away. */}
      <div
        ref={curtainRef}
        className="absolute inset-0 flex flex-col items-center justify-center bg-canvas text-ink"
        style={{ clipPath: "inset(0 0 0% 0)" }}
      >
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 font-mono text-base tracking-[0.18em] text-ink sm:text-lg">
            <span
              ref={dotRef}
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-primary"
              style={{ transform: "scale(0)" }}
            />
            <span ref={brandRef} style={{ opacity: 0 }}>
              {SITE.shortName.toLowerCase()}
              <span className="opacity-60">.dev</span>
            </span>
          </div>

          {/* Progress bar */}
          <div
            ref={progressTrackRef}
            className="relative h-px w-56 overflow-hidden bg-hairline sm:w-72"
          >
            <div
              ref={progressFillRef}
              aria-hidden
              className="absolute inset-y-0 left-0 right-0 bg-primary"
              style={{
                transform: "scaleX(0)",
                transformOrigin: "left center",
              }}
            />
          </div>

          {/* Progress number + label */}
          <div className="flex items-baseline gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-ink">
            <span ref={progressNumRef}>000</span>
            <span>%</span>
            <span aria-hidden className="mx-2 opacity-40">
              ·
            </span>
            <span className="opacity-70">Loading</span>
          </div>

          {/* Bottom hairline — grows under the brand. */}
          <span
            ref={underlineRef}
            aria-hidden
            className="inline-block h-px w-40 origin-left bg-hairline-strong"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * readynessToProgress — derive a 0–100 progress estimate from the
 * document's readyState. Mirrors the rough percentage most browsers use
 * internally for their native progress bar.
 */
function readynessToProgress(): number {
  if (typeof document === "undefined") return 0
  switch (document.readyState) {
    case "loading":
      return 25
    case "interactive":
      return 75
    case "complete":
      return 100
    default:
      return 0
  }
}
