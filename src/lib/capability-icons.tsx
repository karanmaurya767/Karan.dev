import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap-setup"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Capability icons — minimal line-only SVGs.
 *
 * Single `currentColor` stroke, `fill="none"`, geometric — built in the
 * same dialect as the reference mark: thin, quiet, nested primitives.
 * Each animates on a slow, infinite loop driven by GSAP timelines. A
 * reduced-motion fallback freezes the loop at its starting state.
 *
 * Hover behavior (lg+):
 *   - `mouseenter` pauses the GSAP timeline (icon stops drifting).
 *   - `mouseleave` resumes.
 *   - On mobile, the loop runs continuously — touch has no enter/leave.
 */

const svgProps = {
  className: "h-full w-full",
  viewBox: "0 0 40 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

// Diamond path centred on `cy` — pure geometry, no per-render allocation.
const plane = (cy: number) => `M20 ${cy - 7} L34 ${cy} L20 ${cy + 7} L6 ${cy} Z`

// Helper: attach hover-pause listeners to a wrapper element.
function attachHoverPause(
  el: HTMLElement | null,
  tl: gsap.core.Timeline | gsap.core.Tween[]
) {
  if (!el) return () => {}
  const tweens = Array.isArray(tl) ? tl : [tl]
  function pause() {
    tweens.forEach((t) => t.pause())
  }
  function resume() {
    tweens.forEach((t) => t.resume())
  }
  el.addEventListener("mouseenter", pause)
  el.addEventListener("mouseleave", resume)
  return () => {
    el.removeEventListener("mouseenter", pause)
    el.removeEventListener("mouseleave", resume)
  }
}

// 01 — Stacked planes. Isometric layers that drift apart and re-settle.
export function LayersIcon(): React.ReactElement {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const topRef = useRef<SVGPathElement | null>(null)
  const bottomRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    if (reduced) return
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(topRef.current, { y: -2, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1 })
      .to(bottomRef.current, { y: 2, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
    const detach = attachHoverPause(wrapRef.current, tl)
    return () => {
      detach()
      tl.kill()
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className="h-full w-full">
      <svg {...svgProps} aria-hidden>
        <path ref={topRef} d={plane(13)} />
        <path d={plane(20)} opacity={0.85} />
        <path ref={bottomRef} d={plane(27)} />
      </svg>
    </div>
  )
}

// Three sonar rings, staggered by index — stable, so module scope.
const PULSE_RINGS = [0, 1, 2]

// 02 — Pulse rings. Concentric rings emanating outward, sonar-style.
export function PulseIcon(): React.ReactElement {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const ringRefs = useRef<(SVGCircleElement | null)[]>([])

  useEffect(() => {
    if (reduced) return
    const tweens = ringRefs.current
      .filter((el): el is SVGCircleElement => el !== null)
      .map((el, i) =>
        gsap.fromTo(
          el,
          { scale: 0.4, opacity: 0, transformOrigin: "50% 50%" },
          {
            scale: 2.6,
            opacity: 0,
            transformOrigin: "50% 50%",
            duration: 3.6,
            ease: "power2.out",
            repeat: -1,
            delay: i * 1.2,
          }
        )
      )
    const detach = attachHoverPause(wrapRef.current, tweens)
    return () => {
      detach()
      tweens.forEach((t) => t.kill())
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className="h-full w-full">
      <svg {...svgProps} aria-hidden>
        <circle cx={20} cy={20} r={2} fill="currentColor" stroke="none" />
        {PULSE_RINGS.map((ring, i) => (
          <circle
            key={ring}
            ref={(el) => {
              ringRefs.current[i] = el
            }}
            cx={20}
            cy={20}
            r={6}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
      </svg>
    </div>
  )
}

// 03 — Nested frames. Concentric rounded rects with inner frames breathing.
export function FramesIcon(): React.ReactElement {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const aRef = useRef<SVGRectElement | null>(null)
  const bRef = useRef<SVGRectElement | null>(null)

  useEffect(() => {
    if (reduced) return
    const opts = (delay: number) => ({
      scale: 0.9,
      opacity: 0.55,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay,
    })
    const ta = gsap.to(aRef.current, { ...opts(0), transformOrigin: "50% 50%" })
    const tb = gsap.to(bRef.current, { ...opts(0.4), transformOrigin: "50% 50%" })
    const detach = attachHoverPause(wrapRef.current, [ta, tb])
    return () => {
      detach()
      ta.kill()
      tb.kill()
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className="h-full w-full">
      <svg {...svgProps} aria-hidden>
        <rect x={4} y={4} width={32} height={32} rx={8} />
        <rect
          ref={aRef}
          x={10}
          y={10}
          width={20}
          height={20}
          rx={5.5}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <rect
          ref={bRef}
          x={15.5}
          y={15.5}
          width={9}
          height={9}
          rx={3}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </svg>
    </div>
  )
}

export const CAPABILITY_ICONS = [LayersIcon, PulseIcon, FramesIcon] as const
