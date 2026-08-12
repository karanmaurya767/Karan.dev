import { useEffect, useRef, useState } from "react"
import { List, X } from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE, smoothScrollToHash } from "@/lib/gsap-utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { NAV_LINKS, SITE } from "@/lib/content"
import { cn } from "@/lib/utils"

/**
 * SiteHeader — scroll-aware header.
 *
 * Premium additions:
 *   - Active section indicator: an underline that moves between the
 *     currently-in-view nav link via a GSAP quickTo tween.
 *   - Hide-on-scroll-down: header slides up out of view when scrolling
 *     down, slides back when scrolling up.
 *   - Mobile drawer (existing) + GSAP-driven open/close.
 */
export function SiteHeader() {
  const reduced = useReducedMotion()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0]?.href ?? "#work")
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const drawerLinksRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 80)

      // Hide-on-scroll-down behavior.
      if (!reduced && headerRef.current) {
        const header = headerRef.current
        // Don't hide near top (where solid toggles) or near bottom.
        const nearTop = y < 120
        const scrollingUp = y < lastScrollYRef.current
        lastScrollYRef.current = y
        if (nearTop) {
          gsap.to(header, { y: 0, duration: 0.3, ease: EASE.out })
        } else if (scrollingUp) {
          gsap.to(header, { y: 0, duration: 0.3, ease: EASE.out })
        } else {
          gsap.to(header, {
            y: -64,
            duration: 0.3,
            ease: EASE.out,
          })
        }
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [reduced])

  // Close menu when route hash changes (i.e. user clicks a link).
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener("hashchange", close)
    return () => window.removeEventListener("hashchange", close)
  }, [])

  // Active section indicator — scrolls with the user, slides between links.
  useEffect(() => {
    if (reduced) return
    if (typeof window === "undefined") return

    const indicator = indicatorRef.current
    if (!indicator) return

    // Keep a reference to the parent <nav> so we can translate coordinates
    // from viewport space (getBoundingClientRect) into nav-local space.
    const nav = indicator.parentElement
    if (!nav) return

    const headerLinks = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("[data-nav-link]")
    )
    if (headerLinks.length === 0) return
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => el !== null
    )
    if (sections.length === 0) return

    // Initialize indicator off-screen so the first real update is the one
    // that places it. Avoids a flash-of-zero-width on the first paint.
    gsap.set(indicator, { opacity: 0, width: 0 })

    function moveIndicator(targetLink: HTMLAnchorElement) {
      if (!indicator || !nav) return
      const linkRect = targetLink.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      const x = linkRect.left - navRect.left
      const w = linkRect.width
      gsap.to(indicator, {
        x,
        width: w,
        opacity: 1,
        duration: 0.5,
        ease: EASE.out,
        overwrite: "auto",
      })
    }

    function update() {
      const y = window.scrollY + window.innerHeight * 0.4
      let active: HTMLElement | null = (sections[0] as HTMLElement | undefined) ?? null
      for (const sec of sections) {
        const secEl = sec as HTMLElement
        const top = secEl.getBoundingClientRect().top + window.scrollY
        if (top <= y) active = secEl
      }
      if (!active) return
      const id = `#${active.id}`
      setActiveHref(id)
      const link = headerLinks.find((l) => l.getAttribute("href") === id)
      if (link) moveIndicator(link)
    }

    // Initial position — give the browser two RAFs to settle layout & fonts.
    let raf1 = 0
    let raf2 = 0
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        update()
      })
    })

    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [reduced])

  // GSAP-driven open/close for the mobile drawer.
  useEffect(() => {
    if (!drawerRef.current) return
    if (reduced) {
      gsap.set(drawerRef.current, { display: open ? "block" : "none" })
      return
    }
    if (open) {
      gsap.set(drawerRef.current, { display: "block" })
      const links = drawerLinksRef.current?.querySelectorAll("a") ?? []
      gsap.fromTo(
        drawerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.out }
      )
      gsap.fromTo(
        links,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.out, stagger: 0.04 }
      )
    } else {
      gsap.to(drawerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.18,
        ease: EASE.inOut,
        onComplete: () => {
          if (drawerRef.current) gsap.set(drawerRef.current, { display: "none" })
        },
      })
    }
  }, [open, reduced])

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return
    e.preventDefault()
    smoothScrollToHash(href, 64)
    history.pushState(null, "", href)
    setOpen(false)
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors",
        solid
          ? "border-b border-hairline bg-canvas/85 backdrop-blur"
          : "border-b border-transparent"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6 lg:px-10",
          !solid && "text-overlay-cream"
        )}
      >
        <a
          href="#top"
          data-magnetic
          onClick={(e) => handleNavClick(e, "#top")}
          className="font-mono text-sm tracking-tight"
          aria-label={`${SITE.name} — home`}
        >
          <span className="text-primary">●</span> {SITE.shortName.toLowerCase()}
          <span className="opacity-60">.dev</span>
        </a>

        <nav className="relative hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-nav-link
              onClick={(e) => handleNavClick(e, l.href)}
              className={cn(
                "group/nav relative text-sm transition-colors",
                solid ? "text-body hover:text-ink" : "text-overlay-cream/85 hover:text-overlay-cream",
                activeHref === l.href && (solid ? "text-ink" : "text-overlay-cream")
              )}
            >
              {l.label}
            </a>
          ))}
          {/* Active indicator — fixed-position underline that slides between links. */}
          <span
            ref={indicatorRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 h-px",
              solid ? "bg-ink" : "bg-overlay-cream"
            )}
            style={{ width: 0, opacity: 0, willChange: "transform, width" }}
          />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            data-magnetic
            onClick={(e) => handleNavClick(e, "#contact")}
            className={cn(
              "hidden h-9 items-center rounded-full border px-4 text-sm transition-colors md:inline-flex",
              solid
                ? "border-hairline-strong bg-surface-card text-ink hover:bg-surface-strong"
                : "border-overlay-cream/55 bg-overlay-ink/40 text-overlay-cream backdrop-blur hover:bg-overlay-ink/60"
            )}
          >
            Start a project
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden",
              solid
                ? "border-hairline-strong bg-surface-card text-ink"
                : "border-overlay-cream/55 bg-overlay-ink/40 text-overlay-cream backdrop-blur"
            )}
          >
            {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
          </button>
        </div>
      </div>

      <div
        ref={drawerRef}
        style={{ display: "none" }}
        className={cn(
          "mx-3 mb-3 overflow-hidden rounded-2xl border md:hidden",
          solid
            ? "border-hairline bg-canvas/95 text-ink backdrop-blur"
            : "border-overlay-cream/15 bg-overlay-ink/85 text-overlay-cream backdrop-blur"
        )}
      >
        <div ref={drawerLinksRef} className="flex flex-col p-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                solid ? "text-body hover:bg-hairline-soft hover:text-ink" : "text-overlay-cream/85 hover:bg-overlay-cream/10 hover:text-overlay-cream"
              )}
            >
              {l.label}
            </a>
          ))}
          <div
            className={cn(
              "my-1 h-px",
              solid ? "bg-hairline" : "bg-overlay-cream/15"
            )}
          />
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className={cn(
              "rounded-xl px-3 py-2 text-sm",
              solid ? "text-ink" : "text-overlay-cream"
            )}
          >
            Start a project →
          </a>
        </div>
      </div>
    </header>
  )
}
