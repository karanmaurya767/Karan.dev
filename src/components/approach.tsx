import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SectionHeading } from "@/components/section-heading"
import { APPROACH_STEPS } from "@/lib/content"

/**
 * Approach — the four ordered process steps with bespoke SVG icons, a
 * scroll-drawn connector line, per-card accent strips, and step counters.
 *
 * Premium additions:
 *   - Cards reveal with clip-path top-down wipe.
 *   - Step icons draw themselves on scroll (stroke-dashoffset).
 *   - Step number 0 → N pulses on reaching the final value.
 *   - Connector path animated in two passes (forward + slight back-pulse).
 *   - Step duration label fades in last.
 */
export function Approach() {
  const reduced = useReducedMotion()

  const { scope: connectorScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const path = scope.querySelector("path")
      if (!path) return
      const length = (path as SVGPathElement).getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      // Two-pass: forward, then slight back-pulse for life.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 80%",
          end: "bottom 70%",
          scrub: 1.5,
        },
      })
      tl.to(path, { strokeDashoffset: 0, ease: "none" })
        .to(path, { strokeDashoffset: -length * 0.05, duration: 0.3, ease: "sine.out" }, ">-0.1")
        .to(path, { strokeDashoffset: -length * 0.02, duration: 0.3, ease: "sine.inOut" })
    },
    [reduced]
  )

  // Step cards stagger reveal — clip-path top-down wipe + accent strip grow.
  const { scope: gridScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const cards = scope.querySelectorAll<HTMLElement>(":scope > article")
      const strips = scope.querySelectorAll<HTMLElement>("[data-step-strip]")
      const durations = scope.querySelectorAll<HTMLElement>(
        "[data-step-duration]"
      )

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 75%",
          once: true,
        },
      })
      // Top-down clip-path wipe.
      tl.fromTo(
        cards,
        { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 1.1,
          ease: EASE.out,
          stagger: 0.15,
        },
        0
      )
      tl.fromTo(
        strips,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 0.9,
          ease: EASE.out,
          stagger: 0.15,
        },
        0.3
      )
      // Duration labels fade in last.
      tl.fromTo(
        durations,
        { opacity: 0, y: 4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: EASE.out,
          stagger: 0.1,
        },
        0.7
      )
    },
    [reduced]
  )

  // Counter animation for the step number — animates 1 → actual step number,
  // pulses on final value.
  function Counter({ to }: { to: number }) {
    const ref = useRef<HTMLSpanElement | null>(null)
    useGSAPContextOnRef<HTMLSpanElement>(
      ({ scope }) => {
        if (reduced) return
        const target = scope
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: target,
            start: "top 85%",
            once: true,
          },
        })
        tl.fromTo(
          target,
          { textContent: "0" },
          {
            textContent: to,
            duration: 1.4,
            ease: "power2.out",
            snap: { textContent: 1 },
          },
          0
        ).to(
          target,
          {
            scale: 1.15,
            duration: 0.18,
            ease: "power2.out",
            transformOrigin: "50% 50%",
            yoyo: true,
            repeat: 1,
          },
          ">-0.1"
        ).to(
          target,
          { scale: 1, duration: 0.2, ease: EASE.out },
          ">-0.05"
        )
      },
      ref,
      [to, reduced]
    )
    return (
      <span ref={ref} className="font-mono tabular-nums">
        0
      </span>
    )
  }

  return (
    <section
      id="process"
      aria-labelledby="approach-heading"
      className="relative isolate overflow-hidden border-b border-hairline bg-canvas py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="approach-diagonal"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="var(--hairline-strong)"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#approach-diagonal)" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="— Approach"
          title="A repeatable path from idea to production."
          kicker="Each step is deliberate. None of them are optional."
        />

        <div
          ref={connectorScope}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:block"
        >
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            className="h-[400px] w-full"
          >
            <path
              d="M 150 100 C 400 100, 400 300, 600 300 S 800 100, 1050 100"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
              className="text-hairline-strong"
            />
          </svg>
        </div>

        <ol
          ref={gridScope as unknown as React.RefObject<HTMLOListElement>}
          className="relative mt-14 grid gap-6 md:grid-cols-2"
        >
          {APPROACH_STEPS.map((s, i) => {
            const stepNum = i + 1
            return (
              <article
                key={s.k}
                className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-hairline bg-surface-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-hairline-strong hover:shadow-[0_8px_30px_-12px_rgba(38,37,30,0.12)]"
                style={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              >
                <span
                  data-step-strip
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px] origin-top bg-gradient-to-b from-primary to-primary/40"
                  style={{ transform: "scaleY(0)" }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-canvas-soft/60 via-surface-card to-canvas-soft/30"
                />

                <header className="relative flex items-start justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-light leading-none tracking-tight text-primary">
                      <Counter to={stepNum} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-ink">
                      / 04
                    </span>
                  </div>
                  <StepIcon index={i} />
                </header>

                <div className="relative">
                  <h3 className="text-xl font-medium tracking-tight text-ink">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">
                    {s.d}
                  </p>
                </div>

                <div className="relative mt-auto flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-soft">
                    {s.k}
                  </span>
                  <span
                    data-step-duration
                    className="rounded-full border border-hairline bg-canvas-soft/80 px-2.5 py-1 font-mono text-[10px] text-body"
                    style={{ opacity: 0, transform: "translateY(4px)" }}
                  >
                    {durations[i]}
                  </span>
                </div>
              </article>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// Step durations (matched to each step).
const durations = ["~1 day", "~3 days", "~1 week", "~2 weeks"]

/**
 * StepIcon — four bespoke SVG marks for the process steps.
 * Each loops subtly with GSAP and strokes-draws on scroll into view.
 */
function StepIcon({ index }: { index: number }) {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<SVGGElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useGSAPContextOnRef<SVGGElement>(
    ({ scope }) => {
      if (reduced) return
      const el = scope

      // Stroke-draw on the SVG group — works because all icons use
      // stroke="currentColor" paths/circles.
      const strokes = el.querySelectorAll<SVGGeometryElement>(
        "path, circle, rect"
      )
      strokes.forEach((s) => {
        try {
          const len = s.getTotalLength()
          gsap.set(s, {
            strokeDasharray: len,
            strokeDashoffset: len,
          })
          gsap.to(s, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: EASE.out,
            scrollTrigger: {
              trigger: s,
              start: "top 88%",
              once: true,
            },
          })
        } catch {
          // Some elements (e.g. solid-fill circles) may not have a length.
        }
      })

      switch (index) {
        case 0:
          tweenRef.current = gsap.to(el, {
            rotation: 18,
            transformOrigin: "50% 50%",
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          break
        case 1:
          tweenRef.current = gsap.to(el, {
            y: -3,
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          break
        case 2:
          tweenRef.current = gsap.to(el, {
            rotation: 8,
            transformOrigin: "50% 50%",
            duration: 3.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          break
        case 3:
          tweenRef.current = gsap.to(el, {
            y: -4,
            duration: 1.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          break
      }
    },
    ref,
    [index, reduced]
  )

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    function pause() {
      tweenRef.current?.pause()
    }
    function resume() {
      tweenRef.current?.resume()
    }
    wrap.addEventListener("mouseenter", pause)
    wrap.addEventListener("mouseleave", resume)
    return () => {
      wrap.removeEventListener("mouseenter", pause)
      wrap.removeEventListener("mouseleave", resume)
    }
  }, [])

  const common = {
    className:
      "h-14 w-14 text-ink/80 transition-transform duration-300 group-hover:scale-110",
    viewBox: "0 0 40 40",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  return (
    <div ref={wrapRef} className="inline-block">
      <svg {...common} aria-hidden>
        <g ref={ref}>
          {index === 0 && (
            <>
              <circle cx={20} cy={20} r={14} />
              <path
                d="M20 8 L23 20 L20 32 L17 20 Z"
                fill="currentColor"
                stroke="none"
                opacity={0.8}
              />
              <path d="M8 20 L20 20 L32 20" opacity={0.4} />
            </>
          )}
          {index === 1 && (
            <>
              <rect x={6} y={6} width={28} height={28} rx={3} />
              <path
                d="M6 14 L34 14 M6 20 L34 20 M6 26 L34 26 M14 6 L14 34 M20 6 L20 34 M26 6 L26 34"
                opacity={0.5}
              />
              <circle cx={20} cy={20} r={3} fill="currentColor" stroke="none" />
            </>
          )}
          {index === 2 && (
            <>
              <path d="M20 6 L34 14 L34 26 L20 34 L6 26 L6 14 Z" />
              <path
                d="M20 6 L20 34 M6 14 L34 26 M34 14 L6 26"
                opacity={0.5}
              />
              <circle cx={20} cy={20} r={2} fill="currentColor" stroke="none" />
            </>
          )}
          {index === 3 && (
            <>
              <path d="M20 4 C24 12 26 16 26 24 L14 24 C14 16 16 12 20 4 Z" />
              <circle cx={20} cy={16} r={2} fill="currentColor" stroke="none" />
              <path
                d="M14 26 L10 32 M26 26 L30 32 M18 26 L18 32 M22 26 L22 32"
                opacity={0.7}
              />
            </>
          )}
        </g>
      </svg>
    </div>
  )
}
