import {
  ArrowUp,
  GithubLogo,
  LinkedinLogo,
  TwitterLogo,
  EnvelopeSimple,
  ArrowUpRight,
  MapPin,
} from "@phosphor-icons/react/dist/ssr"
import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE, smoothScrollToHash, tickUnderline } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { FOOTER_COLUMNS, SITE } from "@/lib/content"
import { cn } from "@/lib/utils"

/**
 * SiteFooter — full-bleed background image, dark scrim overlay, brand mark,
 * social icons, link columns, and a back-to-top button.
 *
 * Premium additions:
 *   - Brand mark letter-spacing animates in on scroll.
 *   - Column title underline ticks in.
 *   - Social icons bounce-in.
 *   - Back-to-top button slides in with scale + bounce.
 *   - Existing parallax, wash, columns, link underlines all preserved.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const [showTop, setShowTop] = useState(false)
  const footerRef = useRef<HTMLElement | null>(null)
  const topBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Animate back-to-top button entrance when shown.
  useEffect(() => {
    if (reduced) return
    const btn = topBtnRef.current
    if (!btn) return
    if (showTop) {
      gsap.fromTo(
        btn,
        { scale: 0, rotate: -45 },
        { scale: 1, rotate: 0, duration: 0.5, ease: EASE.back }
      )
    } else {
      gsap.to(btn, {
        scale: 0.5,
        opacity: 0,
        duration: 0.2,
        ease: EASE.inOut,
      })
    }
  }, [showTop, reduced])

  // Background parallax.
  const { scope: bgScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { scale: 1 })
        return
      }
      gsap.fromTo(
        scope,
        { scale: 1.04 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      )
    },
    [reduced]
  )

  // Brand wash drift.
  const { scope: washScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { xPercent: -8 },
        {
          xPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        }
      )
    },
    [reduced]
  )

  // Top row columns.
  const { scope: colsScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const cols = scope.querySelectorAll(":scope > div")
      gsap.fromTo(
        cols,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DUR.base,
          ease: EASE.out,
          stagger: 0.1,
          scrollTrigger: {
            trigger: scope,
            start: "top 88%",
            once: true,
          },
        }
      )
    },
    [reduced]
  )

  // Social icons bounce-in.
  const { scope: socialScope } = useGSAPContext<HTMLUListElement>(
    ({ scope }) => {
      if (reduced) return
      const items = scope.querySelectorAll(":scope > li")
      gsap.fromTo(
        items,
        { opacity: 0, scale: 0, rotate: -45 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.6,
          ease: EASE.back,
          stagger: { each: 0.08, from: "start" },
          scrollTrigger: {
            trigger: scope,
            start: "top 92%",
            once: true,
          },
        }
      )
    },
    [reduced]
  )

  // Footer link columns — title tick + links stagger.
  const { scope: linkColsScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const titles = scope.querySelectorAll<HTMLElement>("[data-col-title]")
      const titleUnderlines = scope.querySelectorAll<HTMLElement>(
        "[data-col-underline]"
      )
      const linkItems = scope.querySelectorAll<HTMLElement>("[data-col-link]")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 88%",
          once: true,
        },
      })
      tl.fromTo(
        titles,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: EASE.out, stagger: 0.08 },
        0
      )
      // Title underlines tick in.
      tl.fromTo(
        titleUnderlines,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.8,
          ease: EASE.out,
          stagger: 0.08,
        },
        0.2
      )
      // Links stagger fade-up.
      tl.fromTo(
        linkItems,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: EASE.out,
          stagger: 0.04,
        },
        0.3
      )
    },
    [reduced]
  )

  // Brand mark letter-spacing animation.
  const { scope: brandScope } = useGSAPContext<HTMLAnchorElement>(
    ({ scope }) => {
      if (reduced) return
      gsap.fromTo(
        scope,
        { letterSpacing: "0.6em", opacity: 0 },
        {
          letterSpacing: "0.025em",
          opacity: 1,
          duration: 1.2,
          ease: EASE.out,
          scrollTrigger: {
            trigger: scope,
            start: "top 92%",
            once: true,
          },
        }
      )
    },
    [reduced]
  )

  function scrollToTop() {
    smoothScrollToHash("#top", 0)
  }

  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden text-overlay-cream"
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div ref={bgScope} className="h-full w-full">
          <img
            src="/assets/contact-cover-image.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-overlay-ink/85 via-overlay-ink/75 to-overlay-ink/95" />
        <div
          ref={washScope}
          className="absolute inset-y-0 left-1/2 -z-10 h-full w-[120%] -translate-x-1/2 bg-[radial-gradient(circle_at_top_right,rgba(245,78,0,0.22),transparent_55%)]"
          style={{ transform: "translateX(-8%)" }}
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:py-20 lg:px-10">
        <div
          ref={colsScope}
          className="grid gap-10 border-b border-overlay-cream/15 pb-12 md:grid-cols-[1.4fr_1fr] md:items-end"
        >
          <div>
            <a
              ref={brandScope as unknown as React.RefObject<HTMLAnchorElement>}
              href="#top"
              onClick={(e) => {
                if (!"#top".startsWith("#")) return
                e.preventDefault()
                smoothScrollToHash("#top", 0)
              }}
              className="inline-block font-mono text-sm tracking-tight text-overlay-cream"
              aria-label={`${SITE.name} — home`}
            >
              <span className="text-primary">●</span> {SITE.shortName.toLowerCase()}
              <span className="opacity-60">.dev</span>
            </a>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href={`mailto:${SITE.email}`}
              data-magnetic="strong"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition-colors hover:bg-[var(--primary-active)]"
            >
              <EnvelopeSimple size={16} weight="bold" />
              Start a project
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="font-mono text-sm text-overlay-cream/80 underline decoration-overlay-cream/30 underline-offset-4 transition-colors hover:decoration-primary hover:text-overlay-cream"
            >
              {SITE.email}
            </a>
            <span className="inline-flex items-center gap-1.5 text-xs text-overlay-cream/60">
              <MapPin size={12} weight="duotone" />
              {SITE.location}
            </span>
          </div>
        </div>

        {/* Middle row: 3 link columns */}
        <div
          ref={linkColsScope}
          className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3"
        >
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3
                data-col-title
                className="font-mono text-xs uppercase tracking-[0.18em] text-overlay-cream/70"
                style={{ opacity: 0, transform: "translateY(8px)" }}
              >
                {col.title}
              </h3>
              <span
                data-col-underline
                aria-hidden
                className="mt-2 block h-px w-8 origin-left bg-primary/70"
                style={{ transform: "scaleX(0)" }}
              />
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, href]) => {
                  const isExternal = href.startsWith("http")
                  return (
                    <li key={label} data-col-link>
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        onClick={(e) => {
                          if (href.startsWith("#")) {
                            e.preventDefault()
                            smoothScrollToHash(href, 64)
                          }
                        }}
                        className="group/link relative inline-flex items-center gap-1.5 text-sm text-overlay-cream/90 transition-colors hover:text-primary"
                      >
                        <span>{label}</span>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-100"
                        />
                        {isExternal && (
                          <ArrowUpRight
                            size={12}
                            weight="bold"
                            className="opacity-0 transition-opacity group-hover/link:opacity-100"
                          />
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Social row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-overlay-cream/15 pt-8 sm:flex-row sm:items-center">
          <ul ref={socialScope} className="flex items-center gap-2">
            <SocialIcon href={SITE.github} label="GitHub">
              <GithubLogo size={16} weight="duotone" />
            </SocialIcon>
            <SocialIcon href={SITE.linkedin} label="LinkedIn">
              <LinkedinLogo size={16} weight="duotone" />
            </SocialIcon>
            <SocialIcon href={SITE.twitter} label="X / Twitter">
              <TwitterLogo size={16} weight="duotone" />
            </SocialIcon>
          </ul>

          <a
            href={`mailto:${SITE.email}`}
            className="font-mono text-xs text-overlay-cream/60 transition-colors hover:text-overlay-cream sm:text-sm"
          >
            {SITE.email}
          </a>
        </div>

        {/* Bottom row: copyright + tech credit + back to top */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-overlay-cream/60 sm:flex-row sm:items-center">
          <span>
            © {year} {SITE.name}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono">
              Built with React · Vite · Tailwind · GSAP
            </span>
            <button
              ref={topBtnRef}
              type="button"
              data-magnetic
              onClick={scrollToTop}
              aria-label="Back to top"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border border-overlay-cream/30 bg-overlay-ink/40 px-3 text-sm text-overlay-cream backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-overlay-cream/60 hover:bg-overlay-ink/60",
                showTop ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <ArrowUp size={12} weight="bold" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        data-magnetic
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-overlay-cream/30 bg-overlay-ink/40 text-overlay-cream backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-on-primary"
      >
        {children}
      </a>
    </li>
  )
}
