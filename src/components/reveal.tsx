import { useRef, type ReactNode } from "react"
import { gsap } from "@/lib/gsap-setup"
import { prefersReducedMotion } from "@/lib/gsap-setup"
import { DUR, EASE } from "@/lib/gsap-utils"
import { useGSAPContext } from "@/hooks/use-gsap-context"

type Direction = "bottom" | "top" | "left" | "right"

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  /** Direction the reveal comes from. Default `bottom`. */
  from?: Direction
  /** Optional initial scale-down (0.96 by default if true). */
  scale?: boolean
  /** Override the rendered element tag. */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "ul"
}

/**
 * Reveal — animates its children in on scroll using GSAP + ScrollTrigger.
 *
 * Drop-in replacement for the Motion-based version. Public API extended:
 *
 *   <Reveal
 *     delay={0.05}
 *     from="left"        // bottom | top | left | right
 *     scale              // initial scale-down 0.96 → 1
 *     as="article"       // override rendered tag
 *     className="..."
 *   >...</Reveal>
 *
 * Honors `prefers-reduced-motion: reduce` by rendering the children statically
 * with no ScrollTrigger attach — no jank, no animation, no layout shift.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  from = "bottom",
  scale = false,
  as = "div",
}: RevealProps) {
  const { scope } = useGSAPContext<HTMLDivElement>(({ scope }) => {
    // Build the from-state from `from` direction.
    const fromState: gsap.TweenVars = { opacity: 0 }
    if (from === "bottom") fromState.y = y
    if (from === "top") fromState.y = -y
    if (from === "left") fromState.x = y
    if (from === "right") fromState.x = -y
    if (scale) fromState.scale = 0.96

    gsap.fromTo(
      scope,
      fromState,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: DUR.base,
        ease: EASE.out,
        delay,
        scrollTrigger: {
          trigger: scope,
          start: "top 85%",
          once: true,
        },
      }
    )
  }, [])

  // Reduced-motion path: render straight through, no GSAP, no ScrollTrigger.
  const Tag = as
  if (prefersReducedMotion()) {
    return <Tag className={className}>{children}</Tag>
  }

  // Cast to HTMLElement — all supported tags share the parent ref interface.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = scope as unknown as any
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
