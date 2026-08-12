import { useEffect, useState } from "react"
import { prefersReducedMotion } from "@/lib/gsap-setup"

/**
 * useReducedMotion — React hook mirroring Motion's `useReducedMotion`.
 *
 * Returns `true` if the user has `prefers-reduced-motion: reduce` set in
 * their OS or browser. Updates live when the preference changes.
 *
 * SSR-safe: returns `false` during render until mount, matching Motion's
 * behavior so we don't block the initial paint or trigger hydration mismatch.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)

    function onChange(e: MediaQueryListEvent) {
      setReduced(e.matches)
    }

    // Modern API + Safari < 14 fallback.
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    }
    mq.addListener(onChange)
    return () => mq.removeListener(onChange)
  }, [])

  return reduced
}

// Re-export the SSR-safe function for non-React callers.
export { prefersReducedMotion }