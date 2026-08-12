import { useEffect, useRef, useState, lazy, Suspense } from "react"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import {
  DUR,
  EASE,
  smoothScrollToHash,
  revealHeadline,
  revealText,
} from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HeroMedia } from "@/components/hero-media"
import { DayNightSwitch } from "@/components/day-night-switch"
import { SITE } from "@/lib/content"

// Lazy-load the two client-only widgets so the hero shell renders instantly.
const LazyWidget = lazy(() =>
  import("@/components/hero-widgets").then((m) => ({ default: m.HeroWidgets }))
)

/**
 * Hero — single-mode hero with cinematic entrance, parallax video,
 * floating widget stack, and a wired-in day/night toggle.
 *
 * Premium animation stack:
 *   - Title: char-by-char reveal with clip-mask + soft blur cascade
 *     (revealHeadline + blur fade-in for cinematic depth).
 *   - Subtitle: word-by-word stagger reveal (no DOM text mutation,
 *     so the subtitle's bounding box stays stable and never overlaps
 *     the title above).
 *   - Eyebrow dot pulses + color-flashes on day/night toggle.
 *   - Decorative grid lines fade in on scroll-in with mask.
 *   - Background brand wash drifts on scroll (parallax y + rotate).
 *   - Cursor-aware radial gradient that follows the mouse — gives the
 *     hero a tactile, "lit" feel.
 *   - CTAs use magnetic="strong" for extra pull + clip-mask stagger.
 *   - Widget panels do subtle ken-burns on hover (scale + image drift).
 *   - Hero pinned briefly on first scroll-past so the cinematic
 *     entrance doesn't get cut short by impatient scrolling.
 */
export function Hero() {
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLElement | null>(null)
  const eyebrowDotRef = useRef<HTMLSpanElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const brandWashRef = useRef<HTMLDivElement | null>(null)
  const cursorGlowRef = useRef<HTMLDivElement | null>(null)
  const widgetPanel1Ref = useRef<HTMLDivElement | null>(null)
  const widgetPanel2Ref = useRef<HTMLDivElement | null>(null)
  const textBlockRef = useRef<HTMLDivElement | null>(null)
  const subtitleShimmerRef = useRef<HTMLSpanElement | null>(null)
  const shimmerShimmerTweenRef = useRef<gsap.core.Tween | null>(null)
  const [mode, setMode] = useState<"day" | "night">("day")

  // Cinematic entrance: eyebrow underline ticks → title slide up → subtitle
  // word stagger → CTAs staggered.
  //
  // IMPORTANT: `revealHeadline` only animates the *chars* inside the title
  // (yPercent 110 → 0). The title element's own opacity/y must be set to
  // visible explicitly, otherwise the inline `style={{ opacity: 0 }}` plus
  // our `gsap.set(targets, { opacity: 0 })` will keep the title invisible
  // even after the chars have finished sliding up.
  const { scope: heroScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      const targets = scope.querySelectorAll("[data-anim]")
      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "all" })
        return
      }
      // Soft fade + lift for the parent — keeps motion without dropping
      // the title far enough that its resting position is below the
      // subtitle's start area, which contributed to the perceived overlap.
      gsap.set(targets, { opacity: 0, y: 24 })

      const eyebrowEl = scope.querySelector<HTMLElement>(
        '[data-anim="eyebrow"]'
      )
      const eyebrowDot = eyebrowEl?.querySelector<HTMLElement>(
        "[data-eyebrow-dot]"
      )
      const eyebrowUnderline = eyebrowEl?.querySelector<HTMLElement>(
        "[data-eyebrow-underline]"
      )
      const titleEl = scope.querySelector<HTMLElement>('[data-anim="title"]')
      const subtitleEl = scope.querySelector<HTMLElement>(
        '[data-anim="subtitle"]'
      )
      const ctas = scope.querySelectorAll<HTMLElement>('[data-anim="cta"]')

      const tl = gsap.timeline({ defaults: { duration: 1.1, ease: EASE.out } })
      if (eyebrowDot) {
        tl.fromTo(
          eyebrowDot,
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: EASE.back },
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
      if (eyebrowEl) {
        tl.to(eyebrowEl, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      }
      if (titleEl) {
        // Bring the title element itself up to full opacity so the chars are
        // visible as they slide in through the clip-mask. The revealHeadline
        // helper handles per-char motion, but it never touches the parent's
        // opacity — without this line the title stays at 0 and the text
        // appears to "crack" into view.
        tl.to(
          titleEl,
          { opacity: 1, y: 0, duration: 0.6, ease: EASE.out },
          0.2
        )
        // Char-by-char reveal with clip-mask for premium drama. Delay aligned
        // with the parent fade so both finish near the same time.
        const headlineTl = revealHeadline(titleEl, {
          stagger: 0.022,
          duration: 1,
          delay: 0.4,
        })
        // Cinematic blur cascade — each title char briefly blurs out of
        // focus as it slides up, then sharpens as it lands. Pairs with the
        // clip-mask reveal for a "refocus" feel like a cinema lens.
        headlineTl.call(() => {
          const chars = titleEl.querySelectorAll<HTMLElement>(".char")
          if (!chars.length) return
          gsap.set(chars, { filter: "blur(8px)" })
          gsap.to(chars, {
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.022,
            ease: EASE.out,
            delay: 0.4,
          })
        }, [], 0)
      }
      if (subtitleEl) {
        // Two-part subtitle animation:
        //   (a) Parent tween — restores opacity to 1 and y to 0 (the
        //       intro gsap.set put the parent at opacity:0, y:24). Runs
        //       in parallel with the title chars so the subtitle is
        //       visible as soon as the title finishes. Critically: the
        //       parent itself DOES NOT have its textContent mutated here.
        //   (b) revealText — per-word stagger inside the subtitle for
        //       premium flair. This only animates opacity and translateY
        //       of the word <span> children, never their text. So the
        //       subtitle's bounding box stays rock-stable throughout
        //       the entrance — no more 84px vertical jitter like the
        //       old charScramble caused.
        // (Replace a previous charScramble pass that mutated textContent
        //  every frame, reflowing the subtitle's box and overlapping the
        //  title above it.)
        if (reduced) {
          gsap.set(subtitleEl, { opacity: 1, y: 0, clearProps: "all" })
        } else {
          tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.5, ease: EASE.out }, 1.6)
          revealText(subtitleEl, { stagger: 0.018, duration: 0.55, delay: 1.7 })
        }
      }
      if (ctas.length) {
        // Multi-stage CTA entrance:
        //   (a) clip-path wipe (left → right) for a cinematic reveal.
        //   (b) opacity + y fade-in to settle the CTA into place.
        //   (c) staggered per-CTA so they appear one after another.
        // The clip wipe alone can look weird if the parent uses
        // `border-radius` and clip-path isn't visible at edges, so we
        // also nudge y for a soft lift.
        tl.fromTo(
          ctas,
          { clipPath: "inset(0 100% 0 0)", opacity: 0, y: 12 },
          {
            clipPath: "inset(0 0% 0 0)",
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: EASE.out,
            stagger: 0.14,
          },
          1.0
        )
      }
    },
    [reduced]
  )

  // Hero video parallax on scroll (subtle).
  const { scope: mediaScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.to(scope, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      })
    },
    [reduced]
  )

  // Text block parallax — counter-drifts vs the video for a sense of
  // depth (text moves opposite to the video, so the gap widens on scroll).
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.to(scope, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      })
    },
    textBlockRef,
    [reduced]
  )

  // Brand wash — drifts on TWO axes (y + slow rotate) for an organic feel.
  // Plus a subtle scale breath so the wash never feels static.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { opacity: 0.6 })
        return
      }
      gsap.set(scope, { opacity: 0 })
      // Drift on Y (parallax, slow).
      gsap.to(scope, {
        yPercent: -18,
        rotation: 8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      })
      // Idle breath — never let the wash sit perfectly still.
      gsap.to(scope, {
        opacity: 0.55,
        duration: 1.4,
        ease: EASE.out,
        delay: 0.6,
      })
      gsap.to(scope, {
        scale: 1.12,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "60% 40%",
      })
    },
    brandWashRef,
    [reduced]
  )

  // Widget stack fade+lift on mount.
  const { scope: widgetStackScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.4,
          ease: EASE.out,
        }
      )
    },
    [reduced]
  )

  // Widget stack subtle parallax on scroll.
  const { scope: widgetParallaxScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.to(scope, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      })
    },
    [reduced]
  )

  // Widget panel clip-reveal on mount (cinematic clip-mask entrance).
  const { scope: widgetClipScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { clipPath: "none" })
        return
      }
      gsap.fromTo(
        scope,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.1,
          delay: 0.3,
          ease: EASE.out,
        }
      )
    },
    [reduced]
  )

  // Eyebrow dot pulse — gentle loop while hero is in view.
  useEffect(() => {
    if (reduced) return
    const el = eyebrowDotRef.current
    if (!el) return
    const tween = gsap.to(el, {
      scale: 1.35,
      duration: 1.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "50% 50%",
    })
    return () => {
      tween.kill()
    }
  }, [reduced])

  // Eyebrow dot color flash on day/night toggle — quick + satisfying.
  useEffect(() => {
    if (reduced) return
    const el = eyebrowDotRef.current
    if (!el) return
    gsap.killTweensOf(el, "boxShadow")
    gsap.fromTo(
      el,
      { boxShadow: "0 0 0 0 rgba(245,78,0,0.0)" },
      {
        boxShadow: "0 0 0 8px rgba(245,78,0,0.0)",
        duration: 0.8,
        ease: EASE.out,
      }
    )
  }, [mode, reduced])

  // Subtitle shimmer — a soft gradient sweep across the subtitle text
  // after the entrance finishes. Uses a `<span>` mask gradient with
  // translateX that loops slowly. Honors reduced-motion: instant.
  //
  // IMPORTANT: must be created AFTER `splitWords` runs (it clears the
  // subtitle's children when wrapping words), otherwise the shimmer
  // span gets nuked during the entrance. We wait 1s after mount so
  // the timeline has run.
  useEffect(() => {
    if (reduced) return
    const sub = document.querySelector<HTMLElement>(
      '[data-anim="subtitle"]'
    )
    if (!sub) return

    // Wait until splitWords has populated the subtitle.
    const setupTimer = window.setTimeout(() => {
      if (sub.querySelector("span[aria-hidden][data-shimmer]")) return
      const shimmer = document.createElement("span")
      shimmer.setAttribute("data-shimmer", "")
      shimmer.setAttribute("aria-hidden", "true")
      shimmer.style.position = "absolute"
      shimmer.style.top = "0"
      shimmer.style.bottom = "0"
      shimmer.style.left = "0"
      shimmer.style.width = "33%"
      shimmer.style.pointerEvents = "none"
      shimmer.style.background =
        "linear-gradient(110deg, transparent 0%, rgba(245,78,0,0.0) 35%, rgba(245,78,0,0.55) 50%, rgba(245,78,0,0.0) 65%, transparent 100%)"
      shimmer.style.mixBlendMode = "screen"
      shimmer.style.willChange = "transform"
      // Ensure parent is positioned.
      if (getComputedStyle(sub).position === "static") {
        sub.style.position = "relative"
      }
      sub.appendChild(shimmer)
      subtitleShimmerRef.current = shimmer

      const tween = gsap.fromTo(
        shimmer,
        { xPercent: -120 },
        {
          xPercent: 220,
          duration: 2.6,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 4,
        }
      )
      // Stash for cleanup.
      shimmerShimmerTweenRef.current = tween
    }, 1500)

    return () => {
      window.clearTimeout(setupTimer)
      shimmerShimmerTweenRef.current?.kill()
      shimmerShimmerTweenRef.current = null
      const el = sub.querySelector('span[data-shimmer]')
      el?.remove()
      subtitleShimmerRef.current = null
    }
  }, [reduced])

  // CTA ripple effect — click anywhere on a CTA triggers a radial
  // highlight pulse that radiates from the click point. Lightweight
  // and GPU-friendly: a single radial-gradient div that scales out.
  useEffect(() => {
    if (reduced) return
    const ctas = heroRef.current?.querySelectorAll<HTMLElement>(
      '[data-anim="cta"]'
    )
    if (!ctas || !ctas.length) return

    const cleanups: Array<() => void> = []
    ctas.forEach((cta) => {
      // Inject a ripple surface once per CTA.
      const ripple = document.createElement("span")
      ripple.className = "pointer-events-none absolute inset-0 rounded-full"
      ripple.style.background =
        "radial-gradient(circle at center, rgba(245,78,0,0.45) 0%, rgba(245,78,0,0.0) 70%)"
      ripple.style.opacity = "0"
      ripple.style.transform = "scale(0.4)"
      ripple.style.transformOrigin = "center center"
      ripple.style.willChange = "transform, opacity"
      // Ensure the CTA is positioned so the ripple can sit absolutely.
      const prevPos = getComputedStyle(cta).position
      if (prevPos === "static") cta.style.position = "relative"
      cta.style.overflow = "hidden"
      cta.appendChild(ripple)

      const handler = (e: MouseEvent) => {
        const rect = cta.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        gsap.killTweensOf(ripple)
        gsap.set(ripple, {
          x: x - rect.width / 2,
          y: y - rect.height / 2,
          scale: 0.4,
          opacity: 0,
        })
        gsap.to(ripple, {
          scale: 1.6,
          opacity: 1,
          duration: 0.25,
          ease: EASE.out,
          onComplete: () => {
            gsap.to(ripple, {
              opacity: 0,
              duration: 0.5,
              ease: EASE.out,
            })
          },
        })
      }
      cta.addEventListener("click", handler)
      cleanups.push(() => {
        cta.removeEventListener("click", handler)
        ripple.remove()
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [reduced])

  // Cursor-aware glow — a soft radial gradient that follows the mouse
  // pointer over the hero. Disabled on touch devices and reduced motion.
  useEffect(() => {
    if (reduced) return
    const el = cursorGlowRef.current
    const hero = heroRef.current
    if (!el || !hero) return

    // Skip on touch.
    if (window.matchMedia("(pointer: coarse)").matches) return

    const setX = gsap.quickTo(el, "x", { duration: 0.6, ease: EASE.out })
    const setY = gsap.quickTo(el, "y", { duration: 0.6, ease: EASE.out })
    const setOpacity = gsap.quickTo(el, "opacity", {
      duration: 0.4,
      ease: EASE.out,
    })

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setX(x)
      setY(y)
      setOpacity(0.55)
    }
    const onLeave = () => setOpacity(0)

    hero.addEventListener("mousemove", onMove)
    hero.addEventListener("mouseleave", onLeave)
    return () => {
      hero.removeEventListener("mousemove", onMove)
      hero.removeEventListener("mouseleave", onLeave)
    }
  }, [reduced])

  // Grid lines fade-in on scroll past hero top.
  const { scope: gridScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { opacity: 1 })
        return
      }
      gsap.fromTo(
        scope,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.4,
          ease: EASE.out,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 50%",
            once: true,
          },
        }
      )
    },
    [reduced]
  )

  // Widget panel ken-burns — subtle scale + slight rotate on hover for
  // a tactile, "alive" feel. Uses a paired quickTo + GSAP timeline so
  // the panel is responsive on entry and settles on leave.
  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const onEnter = () => {
        gsap.to(scope, {
          scale: 1.025,
          rotate: 0.4,
          y: -2,
          duration: 0.5,
          ease: EASE.out,
        })
      }
      const onLeave = () => {
        gsap.to(scope, {
          scale: 1,
          rotate: 0,
          y: 0,
          duration: 0.6,
          ease: EASE.out,
        })
      }
      scope.addEventListener("mouseenter", onEnter)
      scope.addEventListener("mouseleave", onLeave)
      return () => {
        scope.removeEventListener("mouseenter", onEnter)
        scope.removeEventListener("mouseleave", onLeave)
      }
    },
    widgetPanel1Ref,
    [reduced]
  )

  useGSAPContextOnRef<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const onEnter = () => {
        gsap.to(scope, {
          scale: 1.025,
          rotate: -0.4,
          y: -2,
          duration: 0.5,
          ease: EASE.out,
        })
      }
      const onLeave = () => {
        gsap.to(scope, {
          scale: 1,
          rotate: 0,
          y: 0,
          duration: 0.6,
          ease: EASE.out,
        })
      }
      scope.addEventListener("mouseenter", onEnter)
      scope.addEventListener("mouseleave", onLeave)
      return () => {
        scope.removeEventListener("mouseenter", onEnter)
        scope.removeEventListener("mouseleave", onLeave)
      }
    },
    widgetPanel2Ref,
    [reduced]
  )

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative isolate min-h-[100svh] overflow-hidden text-overlay-cream"
    >
      <div ref={mediaScope} className="absolute inset-0 will-change-transform">
        <HeroMedia
          mode={mode}
          daySrc="/assets/hero-background-video.mp4"
          nightSrc="/assets/hero-night-video.mp4"
          dayPoster="/assets/hero-day-poster.webp"
          nightPoster="/assets/hero-night-poster.webp"
        />
      </div>

      {/* Brand wash — drifts on scroll, rotates slowly, breathes. */}
      <div
        ref={brandWashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 30%, rgba(245,78,0,0.18), transparent 70%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Cursor-aware glow — follows the mouse pointer. */}
      <div
        ref={cursorGlowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
        style={{
          background:
            "radial-gradient(28% 28% at 0 0, rgba(245,78,0,0.18), transparent 70%)",
          mixBlendMode: "screen",
          transform: "translate(-50%, -50%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Decorative grid lines — fade in on scroll. */}
      <div
        ref={gridScope}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0"
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="hero-grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-overlay-cream/8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pb-16 pt-32 lg:px-10">
        <div ref={textBlockRef as unknown as React.RefObject<HTMLDivElement>} className="relative max-w-3xl">
          <div ref={heroScope}>
          <div
            data-anim="eyebrow"
            style={{ opacity: 0 }}
            className="mb-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-overlay-cream/80"
          >
            <span
              ref={eyebrowDotRef}
              data-eyebrow-dot
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
              style={{ transform: "scale(0)" }}
            />
            <span>{SITE.heroEyebrow}</span>
            <span
              data-eyebrow-underline
              aria-hidden
              className="inline-block h-px w-12 origin-left bg-overlay-cream/40"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <h1
            data-anim="title"
            style={{ opacity: 0 }}
            className="font-sans text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {SITE.heroTitle}
          </h1>
          <p
            data-anim="subtitle"
            style={{ opacity: 0 }}
            className="mt-6 max-w-2xl text-base text-overlay-cream/80 sm:text-lg"
          >
            {SITE.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              data-anim="cta"
              data-magnetic="strong"
              style={{ opacity: 0 }}
              onClick={(e) => {
                e.preventDefault()
                smoothScrollToHash("#work", 64)
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-canvas px-5 text-sm text-ink transition-colors hover:bg-canvas-soft"
            >
              {SITE.heroCtaPrimary}
              <ArrowUpRight size={16} weight="bold" />
            </a>
            <a
              href="#contact"
              data-anim="cta"
              data-magnetic
              style={{ opacity: 0 }}
              onClick={(e) => {
                e.preventDefault()
                smoothScrollToHash("#contact", 64)
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-overlay-cream/55 bg-overlay-ink/30 px-5 text-sm text-overlay-cream backdrop-blur transition-colors hover:bg-overlay-ink/50"
            >
              {SITE.heroCtaSecondary}
            </a>
            <a
              href={SITE.resumeUrl}
              target="_blank"
              rel="noreferrer"
              data-anim="cta"
              data-magnetic
              style={{ opacity: 0 }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-overlay-cream/55 bg-overlay-ink/30 px-5 text-sm text-overlay-cream backdrop-blur transition-colors hover:bg-overlay-ink/50"
            >
              {SITE.heroCtaResume}
              <ArrowUpRight size={16} weight="bold" />
            </a>
            <div
              data-anim="cta"
              style={{ opacity: 0 }}
              className="inline-flex"
            >
              <DayNightSwitch
                variant="sun"
                onChange={(m) => setMode(m === "sun" ? "day" : "night")}
              />
            </div>
          </div>
          </div>
        </div>

        {/* Floating widgets — only on lg+ to keep mobile clean */}
        <div
          ref={widgetParallaxScope as unknown as React.RefObject<HTMLDivElement>}
          className="pointer-events-auto absolute bottom-16 right-6 hidden w-[320px] flex-col gap-3 lg:right-10 lg:flex"
        >
          <div
            ref={widgetClipScope as unknown as React.RefObject<HTMLDivElement>}
            className="overflow-hidden rounded-2xl"
          >
            <div
              ref={(node) => {
                widgetStackScope.current = node
                widgetPanel1Ref.current = node
              }}
              className="rounded-2xl border border-overlay-cream/15 bg-overlay-ink/45 p-3 backdrop-blur-xl"
              style={{ willChange: "transform" }}
            >
              <Suspense
                fallback={
                  <div
                    className="h-24 rounded-xl bg-overlay-cream/10"
                    aria-hidden
                  />
                }
              >
                <LazyWidget kind="location" />
              </Suspense>
            </div>
          </div>
          <div
            ref={widgetPanel2Ref}
            className="rounded-2xl border border-overlay-cream/15 bg-overlay-ink/45 p-3 backdrop-blur-xl"
            style={{ willChange: "transform" }}
          >
            <Suspense
              fallback={
                <div
                  className="h-24 rounded-xl bg-overlay-cream/10"
                  aria-hidden
                />
              }
            >
              <LazyWidget kind="usage" />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
