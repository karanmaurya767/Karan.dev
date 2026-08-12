import { useEffect, useRef, type RefObject } from "react"
import { gsap } from "@/lib/gsap-setup"

type ContextSetup<T extends Element> = (helpers: {
  scope: T
  selector: (q: string) => Element
}) => void

/**
 * Cleanup-safe GSAP context hook.
 *
 * Returns a typed `scope` ref that scopes a `gsap.Context` to the attached
 * element. Every `gsap.to`, `gsap.fromTo`, `ScrollTrigger.create`, etc. created
 * inside the callback is tracked and auto-reverted on unmount or dependency
 * change — no leaked tweens, no orphaned ScrollTriggers.
 *
 * Usage:
 *   const { scope } = useGSAPContext<HTMLDivElement>(({ scope }) => {
 *     gsap.fromTo(scope, { opacity: 0 }, { opacity: 1 })
 *   }, [deps])
 *
 *   return <div ref={scope}>...</div>
 *
 * Mirrors the official GSAP React pattern (Feb 2025+), simplified for our
 * trim 1-context-per-component needs.
 *
 * @typeParam T  Element type the scope is attached to (defaults to HTMLElement).
 *               Use `useGSAPContext<HTMLDivElement>` to get a precisely-typed ref.
 * @param setup  Callback that creates animations. Receives the scoped element
 *               (typed as `T`) and a `selector` helper bound to that element.
 *               Runs synchronously on mount.
 * @param deps   Dependency list. When any dep changes, the previous context is
 *               reverted and the setup runs again.
 */
export function useGSAPContext<T extends Element = Element>(
  setup: ContextSetup<T>,
  deps: ReadonlyArray<unknown> = []
): { scope: RefObject<T | null> } {
  const scopeRef = useRef<T | null>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    const el = scopeRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      setup({
        scope: el,
        selector: (q: string) =>
          (el.querySelector(q) as Element | null) ?? el,
      })
    }, el)

    ctxRef.current = ctx

    return () => {
      ctx.revert()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { scope: scopeRef }
}

/**
 * Ref-paired variant for child components that already own their `ref`.
 *
 * Use when a component has a `useRef` it must keep (e.g. to expose the element
 * to a parent via `forwardRef`, or to attach multiple behaviors to one node).
 * Pass the existing ref — the hook attaches the GSAP context to whatever it
 * currently points to and reverts on unmount or dep change.
 *
 * Mirrors the official GSAP `useGSAP(ref)` pattern from @gsap/react.
 *
 * Usage:
 *   const ref = useRef<HTMLSpanElement>(null)
 *   useGSAPContextOnRef<HTMLSpanElement>(({ scope }) => {
 *     gsap.fromTo(scope, { opacity: 0 }, { opacity: 1 })
 *   }, ref, [reduced])
 *
 *   return <span ref={ref}>…</span>
 *
 * @typeParam T    Element type the ref points to.
 * @param setup    Callback that creates animations. Receives the scoped
 *                 element (typed as `T`) and a `selector` helper bound to it.
 * @param ref      Existing ref to scope the GSAP context to.
 * @param deps     Dependency list. When any dep changes, the previous context
 *                 is reverted and the setup runs again.
 */
export function useGSAPContextOnRef<T extends Element = Element>(
  setup: ContextSetup<T>,
  ref: RefObject<T | null>,
  deps: ReadonlyArray<unknown> = []
): void {
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      setup({
        scope: el,
        selector: (q: string) =>
          (el.querySelector(q) as Element | null) ?? el,
      })
    }, el)

    ctxRef.current = ctx

    return () => {
      ctx.revert()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}