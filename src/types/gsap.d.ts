/**
 * Type augmentations for GSAP under strict TypeScript.
 *
 * The `gsap` package ships its own `.d.ts` files, but we add this stub so
 * `gsap.Context` and related internal types remain assignable when callers
 * store them in our own refs (`useRef<gsap.Context | null>(null)`).
 */

import "gsap"

declare module "gsap" {
  // Intentionally empty — placeholder for project-specific overloads.
  // Example future addition:
  //   export function fromTo<T extends Element>(...): gsap.core.Tween
}

export {}
