/**
 * Shared GSAP constants. Tiny on purpose — not a "framework," just enough to
 * keep durations and easings consistent across the codebase.
 *
 * `expo.out` maps to the same curve we used in Motion (`[0.22, 1, 0.36, 1]`)
 * so the visual feel of existing reveals is preserved after migration.
 */

import { gsap } from "@/lib/gsap-setup"
import { prefersReducedMotion } from "@/lib/gsap-setup"

export const DUR = {
  fast: 0.4,
  base: 0.6,
  slow: 1,
} as const

export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  elastic: "elastic.out(1, 0.4)",
  back: "back.out(1.7)",
} as const

/**
 * Hierarchy of reveal offsets — pick by the importance of the element.
 * `xl` is reserved for hero cinematic entrances.
 */
export const REVEAL_Y = {
  sm: 12,
  md: 24,
  lg: 40,
  xl: 80,
} as const

/**
 * Smooth-scroll to a hash target (e.g. `#work`) using GSAP's ScrollToPlugin.
 * Falls back to native `scrollIntoView` if GSAP fails or the user prefers
 * reduced motion (so screen-reader/keyboard users still land on the section).
 *
 * @param hash  href value starting with `#`
 * @param offset  pixels to subtract from the target Y (default 64 — header height)
 */
export function smoothScrollToHash(hash: string, offset = 64) {
  if (typeof window === "undefined") return
  if (prefersReducedMotion()) {
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    return
  }
  const el = document.querySelector(hash)
  if (!el) return
  gsap.to(window, {
    duration: 0.9,
    ease: EASE.inOut,
    scrollTo: { y: el as Element, offsetY: offset, autoKill: true },
  })
}

/**
 * Split an element's text into per-character `<span class="char">` nodes.
 *
 * Wraps each char in a span set to `display: inline-block` so transforms work.
 * Whitespace is preserved as actual spaces (so words don't collapse). The
 * original text node is removed and replaced with the new structure.
 *
 * Pair with `revealHeadline()` for a premium "chars slide up through a
 * clip-mask parent" effect. Wrap the parent in `overflow: hidden` so the
 * `yPercent: 110` starting state is clipped.
 *
 * @param el  Text-bearing element (h1, h2, span, p, etc.).
 * @returns  The array of char spans (in DOM order).
 */
export function splitChars(el: HTMLElement): HTMLSpanElement[] {
  // Reset any prior split (idempotent).
  if (el.dataset.splitChars === "1") {
    return Array.from(el.querySelectorAll<HTMLSpanElement>(".char"))
  }

  const text = el.textContent ?? ""
  const chars: HTMLSpanElement[] = []
  const frag = document.createDocumentFragment()

  for (const ch of text) {
    if (ch === " " || ch === " ") {
      // Real space — preserves layout. Don't animate it.
      frag.appendChild(document.createTextNode(" "))
      continue
    }
    const span = document.createElement("span")
    span.className = "char"
    span.style.display = "inline-block"
    span.style.willChange = "transform"
    span.textContent = ch
    frag.appendChild(span)
    chars.push(span)
  }

  el.textContent = ""
  el.appendChild(frag)
  el.dataset.splitChars = "1"
  return chars
}

/**
 * Split an element's text into per-word `<span class="word">` nodes.
 * Use for paragraph reveals where per-char would be visually noisy.
 */
export function splitWords(el: HTMLElement): HTMLSpanElement[] {
  if (el.dataset.splitWords === "1") {
    return Array.from(el.querySelectorAll<HTMLSpanElement>(".word"))
  }

  const text = el.textContent ?? ""
  const words: HTMLSpanElement[] = []
  const frag = document.createDocumentFragment()

  // Walk word-by-word, preserving single spaces between words as text nodes.
  const parts = text.split(/(\s+)/)
  for (const part of parts) {
    if (/^\s+$/.test(part) || part === "") {
      frag.appendChild(document.createTextNode(part))
      continue
    }
    const span = document.createElement("span")
    span.className = "word"
    span.style.display = "inline-block"
    span.style.willChange = "transform"
    span.textContent = part
    frag.appendChild(span)
    words.push(span)
  }

  el.textContent = ""
  el.appendChild(frag)
  el.dataset.splitWords = "1"
  return words
}

/**
 * Premium headline reveal — chars slide up from a clip-mask parent.
 *
 * Splits `el` into chars (idempotent), wraps the parent if needed for
 * clip-mask, then animates each char from `yPercent: 110` (clipped) up to `0`.
 *
 * Use a parent with `overflow: hidden` so the chars are clipped during reveal.
 *
 * Returns a `gsap.core.Timeline` so callers can chain or position it.
 */
export function revealHeadline(
  el: HTMLElement,
  opts: { stagger?: number; duration?: number; delay?: number } = {}
): gsap.core.Timeline {
  const { stagger = 0.025, duration = 1.0, delay = 0 } = opts
  const chars = splitChars(el)

  // Ensure a clip-mask ancestor. Create one if missing.
  let clip = el.parentElement
  if (clip && !clip.classList.contains("reveal-clip")) {
    // Wrap el with a clip div.
    const wrapper = document.createElement("span")
    wrapper.className = "reveal-clip"
    wrapper.style.display = "inline-block"
    wrapper.style.overflow = "hidden"
    wrapper.style.verticalAlign = "top"
    el.parentElement?.insertBefore(wrapper, el)
    wrapper.appendChild(el)
    clip = wrapper
  }

  const tl = gsap.timeline({ delay })
  tl.fromTo(
    chars,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration,
      ease: EASE.out,
      stagger,
    },
    0
  )
  return tl
}

/**
 * Reveal text via per-word stagger — `y: 12, opacity: 0 → 1`.
 * Use for paragraphs, subtitles, kickers.
 */
export function revealText(
  el: HTMLElement,
  opts: { stagger?: number; duration?: number; delay?: number } = {}
): gsap.core.Timeline {
  const { stagger = 0.04, duration = 0.6, delay = 0 } = opts
  const words = splitWords(el)
  const tl = gsap.timeline({ delay })
  tl.fromTo(
    words,
    { y: 12, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      ease: EASE.out,
      stagger,
    },
    0
  )
  return tl
}

/**
 * Eyebrow underline tick — a single decorative `<span>` whose `scaleX`
 * animates from 0 → 1 over the eyebrow text. Adds a premium motion beat
 * without much code at the call site.
 */
export function tickUnderline(
  el: HTMLElement,
  opts: { duration?: number; delay?: number } = {}
): gsap.core.Tween {
  return gsap.fromTo(
    el,
    { scaleX: 0, transformOrigin: "left center" },
    {
      scaleX: 1,
      duration: opts.duration ?? 0.9,
      delay: opts.delay ?? 0,
      ease: EASE.out,
    }
  )
}

/**
 * Character scramble — premium decode effect.
 *
 * Cycles random characters through the element's text, then settles on the
 * real text. Pairs nicely with a subtle y-translate + opacity ramp.
 *
 * @param el       Target element. Its current `textContent` is captured as
 *                 the final value.
 * @param opts     Optional duration / delay.
 * @returns        The tween.
 */
export function charScrambleText(
  el: HTMLElement,
  opts: { duration?: number; delay?: number; charset?: string } = {}
): gsap.core.Timeline {
  const {
    duration = 1.1,
    delay = 0,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+?",
  } = opts

  const target = el.textContent ?? ""
  const length = target.length
  const proxy = { v: 0 }
  const chars = charset.split("")

  const tl = gsap.timeline({ delay })
  tl.to(proxy, {
    v: 1,
    duration,
    ease: "none",
    onUpdate: () => {
      const progress = proxy.v
      let out = ""
      for (let i = 0; i < length; i++) {
        // Threshold per character — earlier chars settle first.
        const charProgress = (i / length) * 0.7 + progress * 0.7
        if (charProgress < 1) {
          // Random non-final character from charset.
          const random = chars[Math.floor(Math.random() * chars.length)]
          out += random
        } else {
          out += target[i]
        }
      }
      el.textContent = out
    },
  })
  // Final snap — guarantees the real text on completion even if a frame
  // missed.
  tl.call(() => {
    el.textContent = target
  })
  return tl
}

/**
 * Split a paragraph into per-line word arrays.
 *
 * Walks the text node char-by-char, captures each character's bounding
 * rect via a `Range`, and groups consecutive characters sharing a top
 * coordinate into lines. Each line is then word-split (using the existing
 * `splitWords` rules). Returns a 2D array — `[lineIndex][wordIndex]`.
 *
 * Use for paragraphs where you want line-by-line stagger that matches the
 * actual rendered layout (instead of arbitrary line counts).
 *
 * @param el  Block-level element containing plain text.
 */
export function splitLineWords(el: HTMLElement): HTMLSpanElement[][] {
  if (el.dataset.splitLineWords === "1") {
    // Re-collect from existing structure.
    const lines = Array.from(
      el.querySelectorAll<HTMLSpanElement>(".line")
    )
    return lines.map((line) =>
      Array.from(line.querySelectorAll<HTMLSpanElement>(".word"))
    )
  }

  const text = el.textContent ?? ""
  const range = document.createRange()
  range.selectNodeContents(el)
  const rects = Array.from(range.getClientRects())
  range.detach?.()

  // Group characters by line-top.
  const lines: string[] = []
  const lineTops: number[] = []
  let currentLine = ""
  let currentTop = -1
  for (let i = 0; i < text.length; i++) {
    // Re-create range per character — Range.getBoundingClientRect can
    // throw if the text node mutates during iteration, so wrap in try.
    let top: number
    try {
      const r = document.createRange()
      r.setStart(el.firstChild!, i)
      r.setEnd(el.firstChild!, i + 1)
      top = Math.round(r.getClientRects()[0]?.top ?? 0)
      r.detach?.()
    } catch {
      top = currentTop
    }
    if (currentTop === -1 || Math.abs(top - currentTop) > 4) {
      if (currentLine) lines.push(currentLine)
      lineTops.push(top)
      currentLine = text[i]
      currentTop = top
    } else {
      currentLine += text[i]
    }
  }
  if (currentLine) lines.push(currentLine)
  if (rects.length === 0) {
    // Fallback — single line.
    lines.length = 0
    lines.push(text)
  }

  const frag = document.createDocumentFragment()
  const result: HTMLSpanElement[][] = []
  for (const line of lines) {
    const lineEl = document.createElement("span")
    lineEl.className = "line"
    lineEl.style.display = "block"
    lineEl.style.overflow = "hidden"
    const words: HTMLSpanElement[] = []
    const parts = line.split(/(\s+)/)
    for (const part of parts) {
      if (/^\s+$/.test(part) || part === "") {
        lineEl.appendChild(document.createTextNode(part))
        continue
      }
      const span = document.createElement("span")
      span.className = "word"
      span.style.display = "inline-block"
      span.style.willChange = "transform"
      span.textContent = part
      lineEl.appendChild(span)
      words.push(span)
    }
    frag.appendChild(lineEl)
    result.push(words)
  }
  el.textContent = ""
  el.appendChild(frag)
  el.dataset.splitLineWords = "1"
  return result
}

/**
 * Stagger helper that respects prefers-reduced-motion.
 *
 * Returns 0 when the user prefers reduced motion — collapses any stagger
 * timeline into a single instant update. Use as a drop-in for any
 * `stagger` value.
 */
export function safeStagger(base: number, reduced: boolean): number {
  return reduced ? 0 : base
}

/**
 * Line sweep — a horizontal hairline under a heading or kicker that grows
 * from left on scroll-in. Slightly different from `tickUnderline`: it
 * attaches a scroll trigger so call sites stay one-liners.
 */
export function lineSweep(
  el: HTMLElement,
  triggerEl: HTMLElement,
  opts: { duration?: number; start?: string; once?: boolean } = {}
): gsap.core.Tween {
  const { duration = 1, start = "top 88%", once = true } = opts
  return gsap.fromTo(
    el,
    { scaleX: 0, transformOrigin: "left center" },
    {
      scaleX: 1,
      duration,
      ease: EASE.out,
      scrollTrigger: { trigger: triggerEl, start, once },
    }
  )
}
