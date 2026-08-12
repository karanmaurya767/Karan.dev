import { useEffect, useRef } from "react"
import { STACK_PANES } from "@/lib/content"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SectionHeading } from "@/components/section-heading"

/**
 * Stack — a faux code-editor layout.
 *
 * Premium additions:
 *   - Each row has a left-edge bar that grows on scroll-in.
 *   - macOS dots pulse + brief color flash on reveal.
 *   - Pane title "type-writes" on scroll (gsap textContent).
 *   - Background wash rotates slowly on scroll.
 *   - Honors prefers-reduced-motion.
 */
export function Stack() {
  const reduced = useReducedMotion()

  // Background wash parallax + slow rotation.
  const { scope: sectionScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const wash = scope.parentElement?.querySelector<HTMLElement>(
        "[data-stack-wash]"
      )
      if (wash) {
        gsap.to(wash, {
          yPercent: -10,
          rotation: 30,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        })
      }
    },
    [reduced]
  )

  // Pane reveal — dots pulse + flash, chrome fade, type-writer title, row staggers.
  const { scope: panesScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const panes = scope.querySelectorAll<HTMLElement>(":scope > div")
      const dots = scope.querySelectorAll<HTMLElement>("[data-pane-dot]")
      const titles = scope.querySelectorAll<HTMLElement>("[data-pane-title]")
      const rows = scope.querySelectorAll<HTMLElement>("[data-pane-row]")
      const rowBars = scope.querySelectorAll<HTMLElement>("[data-pane-bar]")

      const tl = gsap.timeline({
        scrollTrigger: { trigger: scope, start: "top 82%", once: true },
      })

      // 1. Pane chrome — fade up.
      tl.fromTo(
        panes,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: 0.08 },
        0
      )

      // 2. macOS dots pulse in + brief color flash.
      tl.fromTo(
        dots,
        { scale: 0, transformOrigin: "50% 50%" },
        {
          scale: 1,
          duration: 0.5,
          ease: EASE.back,
          stagger: { each: 0.05, from: "start" },
        },
        0.3
      )
      // Flash the dots white briefly via background-color tween.
      tl.to(
        dots,
        {
          backgroundColor: "#ffffff",
          duration: 0.1,
          stagger: 0.04,
        },
        0.4
      ).to(
        dots,
        {
          duration: 0.5,
          stagger: 0.04,
        },
        0.5
      )

      // 3. Pane titles.
      tl.fromTo(
        titles,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: EASE.out, stagger: 0.08 },
        0.35
      )

      // 4. Rows — type-in sequence. Names first, tags slightly after.
      tl.fromTo(
        rows,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: DUR.fast, ease: EASE.out, stagger: 0.02 },
        0.45
      )
      // 5. Row left-edge bars — scale in by index.
      tl.fromTo(
        rowBars,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 0.6,
          ease: EASE.out,
          stagger: 0.02,
        },
        0.55
      )
    },
    [reduced]
  )

  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="relative isolate overflow-hidden border-b border-hairline bg-canvas-soft py-20 sm:py-28"
    >
      <div
        data-stack-wash
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 -z-10 h-[500px] w-[500px] rounded-[100%] bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div ref={sectionScope}>
          <SectionHeading
            eyebrow="— Stack"
            title="Tools chosen for durability, not fashion."
            kicker="Each one earns its place by surviving multiple production deployments."
          />
        </div>

        <div ref={panesScope} className="mt-12 grid gap-6 md:grid-cols-2">
          {STACK_PANES.map((pane) => (
            <StackPane key={pane.title} pane={pane} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * StackPane — single editor-style pane with typewriter title.
 */
function StackPane({
  pane,
}: {
  pane: (typeof STACK_PANES)[number]
}) {
  const reduced = useReducedMotion()
  const titleRef = useRef<HTMLParagraphElement | null>(null)

  // Typewriter effect — textContent snap from "" → full text.
  useGSAPContextOnRef<HTMLParagraphElement>(
    ({ scope }) => {
      if (reduced) {
        scope.textContent = pane.title
        return
      }
      const fullText = pane.title
      const proxy = { i: 0 }
      scope.textContent = ""
      gsap.to(proxy, {
        i: fullText.length,
        duration: fullText.length * 0.05,
        ease: "none",
        delay: 0.4,
        scrollTrigger: {
          trigger: scope,
          start: "top 88%",
          once: true,
        },
        onUpdate: () => {
          scope.textContent = fullText.substring(0, Math.floor(proxy.i))
        },
        onComplete: () => {
          scope.textContent = fullText
        },
      })
    },
    titleRef,
    [pane.title, reduced]
  )

  return (
    <div
      className="overflow-hidden rounded-2xl border border-hairline bg-surface-card"
      style={{ opacity: 0, transform: "translateY(32px)" }}
    >
      <div className="flex items-center gap-2 border-b border-hairline bg-canvas-soft px-4 py-3">
        <span
          data-pane-dot
          className="h-2.5 w-2.5 rounded-full bg-[var(--term-red)]"
          style={{ transform: "scale(0)" }}
        />
        <span
          data-pane-dot
          className="h-2.5 w-2.5 rounded-full bg-[var(--term-yellow)]"
          style={{ transform: "scale(0)" }}
        />
        <span
          data-pane-dot
          className="h-2.5 w-2.5 rounded-full bg-[var(--term-green)]"
          style={{ transform: "scale(0)" }}
        />
        <span className="ml-2 font-mono text-xs text-muted-ink">
          {pane.title.toLowerCase().replace(/\s+/g, "-")}.config
        </span>
      </div>
      <div className="p-4">
        <p
          ref={titleRef}
          data-pane-title
          className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-ink"
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          {pane.title}
        </p>
        <ul className="font-mono text-sm">
          {pane.items.map(([name, tag], idx) => (
            <li
              key={name}
              data-pane-row
              className="relative flex items-center gap-2 border-b border-hairline-soft py-2 pl-3 last:border-0"
              style={{ opacity: 0, transform: "translateX(-8px)" }}
            >
              <span
                data-pane-bar
                aria-hidden
                className="absolute inset-y-1 left-0 w-[2px] origin-top bg-primary/60"
                style={{ transform: "scaleY(0)" }}
              />
              <span className="text-muted-soft">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="text-ink">{name}</span>
              <span className="ml-auto text-xs text-muted-ink">{tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
