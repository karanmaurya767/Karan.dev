import { useRef, type ReactNode } from "react"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE, revealHeadline } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  /** Optional sub-line below the title. */
  kicker?: ReactNode
  /** Visual alignment. Default `left`. */
  align?: "left" | "center"
  /** Title level — `h2` default; `h3` for sub-sections. */
  as?: "h2" | "h3"
  /** Optional Tailwind classes merged onto the outer wrapper. */
  className?: string
  /** Title typography classes. */
  titleClassName?: string
}

/**
 * SectionHeading — premium heading primitive used by every section.
 *
 * Reveal sequence (single timeline, fired on scroll via ScrollTrigger):
 *   1. Eyebrow row slides up + fades (`y: 16, opacity: 0`).
 *   2. Eyebrow underline ticks (`scaleX: 0 → 1`).
 *   3. Title chars slide up through a clip-mask (uses `revealHeadline`).
 *   4. Kicker (if present) fades up after a beat.
 *   5. Kicker sweep line grows left→right under the kicker.
 *
 * Honors `prefers-reduced-motion` — renders the static heading with no GSAP.
 *
 * Use everywhere instead of inline `<p>— …</p><h2>…</h2>` blocks for
 * consistent motion across the page.
 */
export function SectionHeading({
  eyebrow,
  title,
  kicker,
  align = "left",
  as = "h2",
  className,
  titleClassName,
}: SectionHeadingProps) {
  const reduced = useReducedMotion()
  const sweepRef = useRef<HTMLSpanElement | null>(null)

  const { scope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return

      const eyebrowEl = scope.querySelector<HTMLElement>("[data-heading-eyebrow]")
      const eyebrowUnderline = scope.querySelector<HTMLElement>(
        "[data-heading-eyebrow] [data-underline]"
      )
      const titleEl = scope.querySelector<HTMLElement>("[data-heading-title]")
      const kickerEl = scope.querySelector<HTMLElement>("[data-heading-kicker]")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 88%",
          once: true,
        },
      })

      if (eyebrowEl) {
        tl.fromTo(
          eyebrowEl,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out },
          0
        )
      }
      if (eyebrowUnderline) {
        tl.fromTo(
          eyebrowUnderline,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.9, ease: EASE.out },
          0.15
        )
      }
      if (titleEl) {
        // Char-by-char reveal with clip-mask via the shared helper.
        revealHeadline(titleEl, { stagger: 0.022, duration: 0.9, delay: 0.2 })
      }
      if (kickerEl) {
        tl.fromTo(
          kickerEl,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out },
          0.55
        )
      }
    },
    [reduced]
  )

  // Sweep line — separate context so it can be triggered independently if
  // kicker reveal finishes before this is wired in.
  useGSAPContextOnRef<HTMLSpanElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.1,
          ease: EASE.out,
          scrollTrigger: {
            trigger: scope.parentElement ?? scope,
            start: "top 85%",
            once: true,
          },
        }
      )
    },
    sweepRef,
    [reduced]
  )

  const Tag = as
  const alignClass = align === "center" ? "text-center" : "text-left"
  const titleSize =
    as === "h3"
      ? "text-xl font-medium tracking-tight text-ink sm:text-2xl"
      : "max-w-3xl text-3xl font-medium tracking-tight text-ink sm:text-4xl"

  return (
    <div
      ref={scope}
      className={cn("flex flex-col gap-3", alignClass, className)}
    >
      {eyebrow && (
        <p
          data-heading-eyebrow
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-ink",
            align === "center" && "justify-center"
          )}
        >
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          <span>{eyebrow}</span>
          <span
            data-underline
            aria-hidden
            className="inline-block h-px w-10 origin-left bg-hairline-strong"
            style={{ transform: "scaleX(0)" }}
          />
        </p>
      )}
      <Tag
        data-heading-title
        className={cn(titleSize, titleClassName)}
      >
        {title}
      </Tag>
      {kicker && (
        <div className="relative">
          <p
            data-heading-kicker
            className={cn(
              "max-w-2xl text-sm leading-relaxed text-body sm:text-base",
              align === "center" && "mx-auto"
            )}
          >
            {kicker}
          </p>
          <span
            ref={sweepRef}
            aria-hidden
            className="absolute -bottom-2 left-0 h-px w-20 origin-left bg-gradient-to-r from-primary/60 via-primary/20 to-transparent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      )}
    </div>
  )
}
