import { useRef, type ReactNode } from "react"
import {
  MapPin,
  Briefcase,
  Buildings,
  Clock,
  GraduationCap,
  Certificate,
  Star,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr"
import { ABOUT_META } from "@/lib/content"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE, splitLineWords, revealHeadline } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * About — bio + meta definition list.
 *
 * Premium additions:
 *   - Heading title chars reveal via revealHeadline.
 *   - Bio paragraphs: line-aware word stagger (splitLineWords).
 *   - Meta dl rows: each row gets a small icon badge that pops in.
 *   - Honors prefers-reduced-motion.
 */
export function About() {
  const reduced = useReducedMotion()
  const headingRef = useRef<HTMLDivElement | null>(null)

  // Heading chars reveal.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const title = scope.querySelector<HTMLElement>("[data-heading-title]")
      if (title) {
        revealHeadline(title, { stagger: 0.022, duration: 0.9, delay: 0.2 })
      }
    },
    headingRef,
    [reduced]
  )

  // Meta dl rows stagger + left-edge hairline grow per row + icon pop-in.
  const { scope: listScope } = useGSAPContext<HTMLDListElement>(
    ({ scope }) => {
      if (reduced) return
      const rows = scope.querySelectorAll<HTMLElement>(":scope > div")
      const lines = scope.querySelectorAll<HTMLElement>("[data-meta-line]")
      const icons = scope.querySelectorAll<HTMLElement>("[data-meta-icon]")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 85%",
          once: true,
        },
      })

      tl.fromTo(
        rows,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: DUR.base, ease: EASE.out, stagger: 0.06 },
        0
      )
      tl.fromTo(
        lines,
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 0.7, ease: EASE.out, stagger: 0.06 },
        0.1
      )
      tl.fromTo(
        icons,
        { scale: 0, rotate: -90, transformOrigin: "50% 50%" },
        {
          scale: 1,
          rotate: 0,
          duration: 0.6,
          ease: EASE.back,
          stagger: 0.06,
        },
        0.2
      )
    },
    [reduced]
  )

  // Left column panel + bio paragraph line-aware word stagger.
  const { scope: panelScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.slow,
          ease: EASE.out,
          scrollTrigger: { trigger: scope, start: "top 85%", once: true },
        }
      )
      // Bio paragraphs: line-aware word stagger.
      const paragraphs = scope.querySelectorAll<HTMLElement>(
        "[data-bio-paragraph]"
      )
      paragraphs.forEach((p) => {
        const lines = splitLineWords(p)
        // Flatten words across lines for a single stagger sequence; we
        // stagger by index, so the visual cascade is "line 1 first,
        // then line 2, …" because lines were split in document order.
        const flat = lines.flat()
        gsap.fromTo(
          flat,
          { y: 10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: EASE.out,
            stagger: 0.012,
            scrollTrigger: { trigger: p, start: "top 88%", once: true },
          }
        )
      })
    },
    [reduced]
  )

  // Right-column meta panel scale-in.
  const { scope: rightScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.slow,
          ease: EASE.out,
          scrollTrigger: { trigger: scope, start: "top 85%", once: true },
        }
      )
    },
    [reduced]
  )

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-b border-hairline bg-canvas py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
        <div ref={panelScope}>
          <div ref={headingRef} className="flex flex-col gap-3">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-ink">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              <span>— About</span>
              <span
                aria-hidden
                className="inline-block h-px w-10 origin-left bg-hairline-strong"
                style={{ transform: "scaleX(0)" }}
              />
            </p>
            <h2
              data-heading-title
              className="max-w-3xl text-3xl font-medium tracking-tight text-ink sm:text-4xl"
            >
              I build production web applications for small teams and growing businesses.
            </h2>
          </div>
          <div className="mt-6 space-y-4 text-body">
            <p data-bio-paragraph>
              I'm a Full Stack Developer based in Varanasi, India, currently
              working at Shubham Infotech as a Software Developer since July
              2025. Over the past year I've led the development and deployment
              of 7+ dynamic web applications — MLM platforms, e-commerce
              stores, NGO portals, and student management systems — all
              built on Laravel, MySQL, and modern frontend stacks.
            </p>
            <p data-bio-paragraph>
              I take ownership of the full SDLC: from requirement analysis
              and database design, through API and frontend development, all
              the way to production deployment on cPanel or Vercel. I work
              directly with clients, translate business needs into technical
              features, and ship work that's actually used by real people.
            </p>
          </div>
        </div>

        <div ref={rightScope} className="opacity-0 [transform:scale(0.98)]">
          <dl
            ref={listScope}
            className="grid grid-cols-1 divide-y divide-hairline rounded-2xl border border-hairline bg-surface-card"
          >
            {ABOUT_META.map(([k, v], i) => (
              <div
                key={k}
                className="relative flex items-baseline gap-3 px-5 py-4"
              >
                <span
                  data-meta-icon
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas-soft text-muted-ink"
                  aria-hidden
                >
                  {metaIcon(k, i)}
                </span>
                <span
                  data-meta-line
                  aria-hidden
                  className="absolute inset-y-3 left-0 w-px origin-top bg-primary/50"
                  style={{ transform: "scaleY(0)" }}
                />
                <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">
                  {k}
                </dt>
                <dd className="ml-auto text-right text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/**
 * metaIcon — picks a Phosphor icon based on the meta row index.
 * Order matches ABOUT_META in lib/content.ts.
 */
function metaIcon(key: string, index: number): ReactNode {
  const iconProps = { size: 14, weight: "duotone" as const }
  switch (index) {
    case 0:
      return <MapPin {...iconProps} />
    case 1:
      return <Briefcase {...iconProps} />
    case 2:
      return <Buildings {...iconProps} />
    case 3:
      return <Clock {...iconProps} />
    case 4:
      return <GraduationCap {...iconProps} />
    case 5:
      return <Certificate {...iconProps} />
    case 6:
      return <Star {...iconProps} />
    case 7:
      return <CheckCircle {...iconProps} />
    default:
      // Fallback keyed by the row label.
      if (key.toLowerCase().includes("based")) return <MapPin {...iconProps} />
      return <CheckCircle {...iconProps} />
  }
}
