import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SectionHeading } from "@/components/section-heading"
import { PROJECTS, type Project } from "@/lib/content"
import { cn } from "@/lib/utils"

/**
 * SelectedWork — horizontal auto-scrolling project card strip.
 *
 * Marquee behaviour (preserved):
 *   - All project cards sit in a single row and continuously scroll left.
 *   - Hovering the strip pauses the auto-scroll; releasing resumes.
 *   - Drag-to-scrub via pointer events.
 *
 * Premium additions:
 *   - 3D tilt on card hover (rotateX/Y from cursor position).
 *   - Inner image parallax + ken-burns (slow scale 1 → 1.04 on hover).
 *   - Card entrance scale-up + opacity when first entering the strip.
 *   - Year ticker above the strip that scrolls horizontally with scrub.
 *   - Honors `prefers-reduced-motion`.
 */
export function SelectedWork() {
  const reduced = useReducedMotion()
  const stripRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const yearTrackRef = useRef<HTMLDivElement | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Section heading reveal.
  const { scope: headerScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DUR.slow,
          ease: EASE.out,
          scrollTrigger: { trigger: scope, start: "top 88%", once: true },
        }
      )
    },
    [reduced]
  )

  // Continuous marquee tween.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const half = scope.scrollWidth / 2
      gsap.to(scope, {
        x: -half,
        duration: half * 0.04, // ~25 px/sec — calm pace
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % -half),
        },
      })
    },
    trackRef,
    []
  )

  // Year ticker scrub — horizontal parallax that tracks scroll velocity.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.to(scope, {
        xPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: scope.parentElement ?? scope,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
    },
    yearTrackRef,
    [reduced]
  )

  // Pause / resume the tween based on hover or focus.
  useEffect(() => {
    if (!trackRef.current) return
    const tweens = gsap.getTweensOf(trackRef.current)
    if (tweens.length === 0) return
    if (isPaused) {
      tweens.forEach((t) => t.pause())
    } else {
      tweens.forEach((t) => t.resume())
    }
  }, [isPaused])

  // Drag-to-scrub.
  useEffect(() => {
    if (reduced) return
    const trackEl = trackRef.current
    if (!trackEl) return
    const track = trackEl

    let isDown = false
    let startX = 0
    let startTweenX = 0

    const getTween = () => gsap.getTweensOf(track)[0] as gsap.core.Tween | undefined

    function onDown(e: PointerEvent) {
      isDown = true
      startX = e.clientX
      const t = getTween()
      if (t) {
        const target = t.targets()[0] as HTMLElement | undefined
        if (target) {
          const m = target.style.transform.match(/matrix\(([^)]+)\)/)
          if (m) {
            const parts = m[1].split(",").map((s) => parseFloat(s.trim()))
            startTweenX = parts[4] || 0
          }
        }
        t.pause()
      }
      track.setPointerCapture(e.pointerId)
    }

    function onMove(e: PointerEvent) {
      if (!isDown) return
      const t = getTween()
      if (!t) return
      const dx = e.clientX - startX
      const target = t.targets()[0] as HTMLElement | undefined
      if (target) gsap.set(target, { x: startTweenX + dx })
    }

    function onUp(e: PointerEvent) {
      if (!isDown) return
      isDown = false
      track.releasePointerCapture(e.pointerId)
      if (!isPaused) {
        const t = getTween()
        if (t) t.resume()
      }
    }

    track.addEventListener("pointerdown", onDown)
    track.addEventListener("pointermove", onMove)
    track.addEventListener("pointerup", onUp)
    track.addEventListener("pointercancel", onUp)
    return () => {
      track.removeEventListener("pointerdown", onDown)
      track.removeEventListener("pointermove", onMove)
      track.removeEventListener("pointerup", onUp)
      track.removeEventListener("pointercancel", onUp)
    }
  }, [isPaused, reduced])

  // Reduced-motion fallback: static grid layout.
  if (reduced) {
    return (
      <section
        id="work"
        aria-labelledby="work-heading"
        className="border-b border-hairline bg-canvas py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div ref={headerScope}>
            <SectionHeading
              eyebrow="— Selected work"
              title="11+ production apps I designed, built, and shipped."
            />
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.index} project={p} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Duplicated list for seamless loop.
  const looped = [...PROJECTS, ...PROJECTS]

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-b border-hairline bg-canvas py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div ref={headerScope}>
          <SectionHeading
            eyebrow="— Selected work"
            title="11+ production apps I designed, built, and shipped."
            kicker="Drag to scrub, hover to pause. Each card is a live Laravel or Flask application I shipped to production."
          />
        </div>

        {/* Year ticker — horizontal scrub bar with year markers. */}
        <div className="relative mt-10 overflow-hidden">
          <div
            ref={yearTrackRef}
            className="flex items-center gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-muted-soft"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-12">
                <span>{2024 + (i % 3)}</span>
                <span className="inline-block h-1 w-1 rounded-full bg-muted-soft/40" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full-bleed strip — extends past the page padding for a clean marquee. */}
      <div
        ref={stripRef}
        className="relative mt-10 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        {/* Soft edge fades so cards don't slam into the viewport edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-canvas to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-canvas to-transparent"
        />

        <div
          ref={trackRef}
          className="flex w-max gap-6 px-6 will-change-transform lg:px-10"
          aria-label="Project showcase, drag to scrub"
        >
          {looped.map((p, i) => (
            <ProjectCard key={`${p.index}-${i}`} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * ProjectCard — individual card with premium 3D tilt + ken-burns image.
 */
function ProjectCard({
  project,
  index,
}: {
  project: Project
  index?: number
}) {
  const cardRef = useRef<HTMLElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(max-width: 1023px)").matches) return

    const card = cardRef.current
    const img = imageRef.current
    if (!card || !img) return

    const setRotateX = gsap.quickTo(card, "rotateX", {
      duration: 0.6,
      ease: EASE.out,
    })
    const setRotateY = gsap.quickTo(card, "rotateY", {
      duration: 0.6,
      ease: EASE.out,
    })
    const setImgY = gsap.quickTo(img, "yPercent", {
      duration: 0.8,
      ease: EASE.out,
    })
    const setImgScale = gsap.quickTo(img, "scale", {
      duration: 0.6,
      ease: EASE.out,
    })

    function onMove(e: PointerEvent) {
      const rect = card!.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      setRotateY(dx * 6)
      setRotateX(dy * -6)
      setImgY(dy * -8)
      setImgScale(1.06)
    }

    function onLeave() {
      setRotateX(0)
      setRotateY(0)
      setImgY(0)
      setImgScale(1.03)
    }

    card.addEventListener("pointermove", onMove)
    card.addEventListener("pointerleave", onLeave)
    return () => {
      card.removeEventListener("pointermove", onMove)
      card.removeEventListener("pointerleave", onLeave)
      gsap.set(card, { clearProps: "transform" })
      gsap.set(img, { clearProps: "transform" })
    }
  }, [])

  return (
    <article
      ref={cardRef}
      data-card-index={index}
      className={cn(
        "group relative flex h-[440px] w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-card",
        "transition-[border-color,box-shadow] duration-300 hover:border-hairline-strong hover:shadow-[0_18px_40px_-22px_rgba(38,37,30,0.25)]",
        "sm:w-[380px]",
        "[transform-style:preserve-3d] [transform:perspective(1000px)]"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-hairline-soft">
        <img
          ref={imageRef}
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-700 group-hover:from-primary/0 group-hover:via-primary/[0.04] group-hover:to-primary/[0.10]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-ink">
          <span className="font-mono text-primary">{project.index}</span>
          <span className="h-px w-4 bg-hairline-strong" />
          <span>{project.year}</span>
          <span className="h-px w-4 bg-hairline-strong" />
          <span className="text-muted-soft">{project.status}</span>
        </div>
        <h3 className="mt-3 text-lg font-medium tracking-tight text-ink">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-body">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[10px] text-body"
            >
              {t}
            </span>
          ))}
        </div>
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          data-magnetic
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-xs text-primary transition-colors hover:text-[var(--primary-active)]"
        >
          View live
          <ArrowUpRight size={12} weight="bold" />
        </a>
      </div>
    </article>
  )
}
