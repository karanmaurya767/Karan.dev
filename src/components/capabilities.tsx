import { useEffect, useRef } from "react"
import { CAPABILITIES } from "@/lib/content"
import { CAPABILITY_ICONS } from "@/lib/capability-icons"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SectionHeading } from "@/components/section-heading"

/**
 * Capabilities — three practice cards with hand-crafted animated icons,
 * scroll-triggered stagger reveals, animated brand wash, hover stroke-draw
 * outline, and hover-pause on icon loops.
 *
 * Premium additions:
 *   - SVG outline traces on hover (stroke-dashoffset animation).
 *   - Icon scale bounce on scroll into view.
 *   - Tag list items fade-up after the card lands (staggered children).
 *   - Brand wash drifts on TWO axes (x + y) for organic feel.
 */
export function Capabilities() {
  const reduced = useReducedMotion()

  const { scope: gridScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const cards = scope.querySelectorAll<HTMLElement>(":scope > article")
      const shines = scope.querySelectorAll<HTMLElement>("[data-card-shine]")
      const tags = scope.querySelectorAll<HTMLElement>("[data-cap-tag]")
      const icons = scope.querySelectorAll<HTMLElement>("[data-cap-icon]")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 80%",
          once: true,
        },
      })

      // Cards stagger up.
      tl.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: DUR.base,
          ease: EASE.out,
          stagger: 0.12,
        },
        0
      )
        // Shine sweep lags each card.
        .fromTo(
          shines,
          { scaleX: 0, transformOrigin: "left center", opacity: 0 },
          {
            scaleX: 1,
            opacity: 0.6,
            duration: 1.2,
            ease: EASE.out,
            stagger: 0.12,
          },
          0.4
        )
        // Icon scale bounce-in.
        .fromTo(
          icons,
          { scale: 0, transformOrigin: "50% 50%" },
          {
            scale: 1,
            duration: 0.7,
            ease: EASE.back,
            stagger: 0.12,
          },
          0.5
        )
        // Tags stagger up after the card lands.
        .fromTo(
          tags,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: DUR.fast,
            ease: EASE.out,
            stagger: { each: 0.04, from: "random" },
          },
          0.7
        )

      // Brand wash dual-axis drift — organic parallax.
      const wash = scope.parentElement?.querySelector<HTMLElement>(
        "[data-brand-wash]"
      )
      if (wash) {
        gsap.to(wash, {
          yPercent: -12,
          xPercent: 6,
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

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative isolate overflow-hidden border-b border-hairline bg-canvas-soft py-20 sm:py-28"
    >
      <div
        data-brand-wash
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1200px] -translate-x-1/2 rounded-[100%] bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="— Capabilities"
          title="Three practice areas, each treated as an engineering discipline."
          kicker="From data integrity to polished UI to repeatable shipping — every product I build touches all three."
        />

        <div ref={gridScope} className="mt-14 grid gap-6 md:grid-cols-3">
          {CAPABILITIES.map((c, i) => {
            const Icon = CAPABILITY_ICONS[i] as unknown as React.ComponentType
            return (
              <CapabilityCard
                key={c.num}
                num={c.num}
                title={c.title}
                body={c.body}
                items={c.items}
                Icon={Icon}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * CapabilityCard — single card with hover stroke-draw outline + icon + tags.
 */
function CapabilityCard({
  num,
  title,
  body,
  items,
  Icon,
}: {
  num: string
  title: string
  body: string
  items: readonly string[]
  Icon: React.ComponentType
}) {
  const cardRef = useRef<HTMLElement | null>(null)
  const outlineRef = useRef<SVGRectElement | null>(null)
  const reduced = useReducedMotion()

  // Hover stroke-draw outline.
  useEffect(() => {
    if (reduced) return
    const card = cardRef.current
    const outline = outlineRef.current
    if (!card || !outline) return

    const length = outline.getTotalLength()
    gsap.set(outline, {
      strokeDasharray: length,
      strokeDashoffset: length,
    })

    function onEnter() {
      gsap.to(outline, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: EASE.out,
      })
    }
    function onLeave() {
      gsap.to(outline, {
        strokeDashoffset: length,
        duration: 0.6,
        ease: EASE.out,
      })
    }

    card.addEventListener("mouseenter", onEnter)
    card.addEventListener("mouseleave", onLeave)
    return () => {
      card.removeEventListener("mouseenter", onEnter)
      card.removeEventListener("mouseleave", onLeave)
    }
  }, [reduced])

  return (
    <article
      ref={cardRef}
      data-card-shine-wrap
      className="group relative flex h-full flex-col gap-6 overflow-hidden rounded-2xl border border-hairline bg-surface-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-hairline-strong hover:shadow-[0_8px_30px_-12px_rgba(38,37,30,0.12)]"
      style={{ opacity: 0, transform: "translateY(32px)" }}
    >
      {/* Hover stroke-draw outline (sits on top of the card). */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <rect
          ref={outlineRef}
          x={1}
          y={1}
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx={15}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.5}
          style={{ vectorEffect: "non-scaling-stroke" }}
        />
      </svg>

      <div
        data-card-shine
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 -z-0 w-1/2 bg-gradient-to-r from-transparent via-primary/[0.05] to-transparent opacity-0"
        style={{ transform: "scaleX(0)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-canvas-soft/40 to-surface-card"
      />
      <header className="relative flex items-start justify-between">
        <span className="font-mono text-3xl font-light leading-none tracking-tight text-ink/70 transition-colors group-hover:text-primary">
          {num.replace("— ", "")}
        </span>
        <div
          data-cap-icon
          className="h-14 w-14 text-ink/80 transition-transform duration-300 group-hover:scale-110"
        >
          <Icon />
        </div>
      </header>

      <div className="relative">
        <h3 className="text-xl font-medium tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-body">{body}</p>
      </div>

      <ul className="relative mt-auto flex flex-wrap gap-2 pt-4">
        {items.map((item) => (
          <li
            key={item}
            data-cap-tag
            className="rounded-full border border-hairline bg-canvas-soft/80 px-2.5 py-1 text-xs text-body backdrop-blur"
            style={{ opacity: 0, transform: "translateY(8px)" }}
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
