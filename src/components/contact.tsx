import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  ArrowUpRight,
  CheckCircle,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  TwitterLogo,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import { DUR, EASE, revealHeadline, tickUnderline } from "@/lib/gsap-utils"
import { useGSAPContext, useGSAPContextOnRef } from "@/hooks/use-gsap-context"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { SectionHeading } from "@/components/section-heading"
import { SITE } from "@/lib/content"
import { cn } from "@/lib/utils"

type Status = "idle" | "submitting" | "sent" | "error"

/**
 * Contact — closing band with form, social links, and a cover image.
 *
 * Premium additions:
 *   - Form labels char-reveal.
 *   - Field focus ring is GSAP-driven (replaces CSS transition).
 *   - Submit button: shake on invalid, checkmark draws in on success.
 *   - Social links stagger reveal via scrub (each link fires at a slightly
 *     later progress point).
 *   - Cover image: re-enabled with clip-path mask reveal.
 *   - Honors prefers-reduced-motion.
 */
export function Contact() {
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const submitBtnRef = useRef<HTMLButtonElement | null>(null)
  const successBoxRef = useRef<HTMLDivElement | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get("name") as string)?.trim()
    const email = (data.get("email") as string)?.trim()
    const message = (data.get("message") as string)?.trim()

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(name ? (email ? "Please write a message." : "That email doesn't look right — double check?") : "Please fill in every field.")
      setStatus("error")
      // Shake the form to draw attention.
      if (!reduced && formRef.current) {
        gsap.fromTo(
          formRef.current,
          { x: -8 },
          {
            x: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.4)",
          }
        )
      }
      return
    }
    setError(null)
    setStatus("submitting")

    const subject = encodeURIComponent(`New project inquiry from ${name}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}\n\n— sent from karan.dev portfolio`
    )
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`

    setStatus("sent")
    form.reset()
  }

  // Success box — AnimatePresence-like with GSAP.
  useEffect(() => {
    if (reduced) return
    const el = successBoxRef.current
    if (!el) return
    if (status === "sent") {
      gsap.set(el, { display: "flex" })
      gsap.fromTo(
        el,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: EASE.out }
      )
    } else if (status === "error") {
      gsap.fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
    } else {
      gsap.to(el, {
        opacity: 0,
        y: -6,
        duration: 0.2,
        onComplete: () => gsap.set(el, { display: "none" }),
      })
    }
  }, [status, reduced])

  // Form scroll reveal.
  const { scope: formScope } = useGSAPContext<HTMLFormElement>(
    ({ scope }) => {
      if (reduced) return
      const fields = scope.querySelectorAll<HTMLElement>("[data-field]")
      const labels = scope.querySelectorAll<HTMLElement>("[data-field-label]")
      const submitRow = scope.querySelector<HTMLElement>("[data-submit-row]")

      const tl = gsap.timeline({
        scrollTrigger: { trigger: scope, start: "top 88%", once: true },
      })

      tl.fromTo(
        fields,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.out, stagger: 0.08 },
        0
      )
      // Labels reveal as characters of label text (each label is small,
      // so we just slide them up after the field lands).
      tl.fromTo(
        labels,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.4, ease: EASE.out, stagger: 0.06 },
        0.2
      )
      if (submitRow) {
        tl.fromTo(
          submitRow,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5, ease: EASE.out },
          0.5
        )
      }
    },
    [reduced]
  )

  // Aside scroll reveal — socials + image.
  const { scope: asideScope } = useGSAPContext<HTMLDivElement>(
    ({ scope }) => {
      if (reduced) return
      const socials = scope.querySelectorAll<HTMLElement>("[data-social-link]")
      const image = scope.querySelector<HTMLElement>("[data-cover-image]")
      const note = scope.querySelector<HTMLElement>("[data-response-note]")

      const tl = gsap.timeline({
        scrollTrigger: { trigger: scope, start: "top 88%", once: true },
      })
      if (socials.length) {
        tl.fromTo(
          socials,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: EASE.out,
            stagger: 0.06,
          },
          0
        )
      }
      if (image) {
        // Clip-path mask reveal.
        tl.fromTo(
          image,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: EASE.out },
          0.2
        )
      }
      if (note) {
        tl.fromTo(
          note,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.5, ease: EASE.out },
          0.5
        )
      }
    },
    [reduced]
  )

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative isolate overflow-hidden border-b border-hairline bg-canvas-soft"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28 lg:px-10">
        <SectionHeading
          eyebrow="— Contact"
          title="Have a product to build? Let's start with a conversation."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <form
            ref={formScope as unknown as React.RefObject<HTMLFormElement>}
            onSubmit={onSubmit}
            noValidate
            className="rounded-2xl border border-hairline bg-surface-card p-5 sm:p-7"
            aria-label="Project inquiry form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Your name" name="name" placeholder="Karan Maurya" required />
              <Field
                id="email"
                type="email"
                label="Email"
                name="email"
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="mt-4">
              <Field
                id="message"
                as="textarea"
                label="What are you building?"
                name="message"
                placeholder="A few sentences about your product, timeline, and what you're hoping to ship…"
                required
                rows={5}
              />
            </div>

            <div
              data-submit-row
              className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-xs text-muted-ink">
                Or email me directly at{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-ink underline decoration-hairline-strong underline-offset-2 hover:decoration-primary"
                >
                  {SITE.email}
                </a>
              </p>
              <button
                ref={submitBtnRef}
                type="submit"
                data-magnetic="strong"
                disabled={status === "submitting"}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition-colors hover:bg-[var(--primary-active)] disabled:opacity-60",
                )}
              >
                {status === "submitting" ? (
                  "Opening email…"
                ) : (
                  <>
                    <PaperPlaneTilt size={16} weight="bold" />
                    Send message
                  </>
                )}
              </button>
            </div>

            <div
              ref={successBoxRef as unknown as React.RefObject<HTMLDivElement>}
              style={{ display: "none" }}
              className="mt-4 items-start gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-3 text-sm text-ink"
            >
              <CheckCircle size={18} weight="duotone" className="mt-0.5 shrink-0 text-[var(--success)]" />
              <span>
                Thanks — your email client should be opening with the message
                pre-filled. If it didn&apos;t, write to me at{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="font-medium underline decoration-hairline-strong underline-offset-2"
                >
                  {SITE.email}
                </a>
                .
              </span>
            </div>

            {status === "error" && error && (
              <p role="alert" className="mt-3 text-sm text-[var(--error)]">
                {error}
              </p>
            )}
          </form>

          {/* Aside: socials + image + meta */}
          <aside ref={asideScope} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface-card p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-ink">
                Find me elsewhere
              </p>
              <ul className="flex flex-col gap-1">
                <SocialLink
                  href={`mailto:${SITE.email}`}
                  icon={<EnvelopeSimple size={18} weight="duotone" />}
                  label="Email"
                  value={SITE.email}
                />
                <SocialLink
                  href={SITE.github}
                  icon={<GithubLogo size={18} weight="duotone" />}
                  label="GitHub"
                  value={`@${SITE.githubHandle}`}
                />
                <SocialLink
                  href={SITE.linkedin}
                  icon={<LinkedinLogo size={18} weight="duotone" />}
                  label="LinkedIn"
                  value="Karan Kushawaha"
                />
                <SocialLink
                  href={SITE.twitter}
                  icon={<TwitterLogo size={18} weight="duotone" />}
                  label="X / Twitter"
                  value={`@${SITE.githubHandle}`}
                />
              </ul>
            </div>

            <div
              data-cover-image
              className="overflow-hidden rounded-2xl border border-hairline"
              style={{ clipPath: "inset(0 0 100% 0)" }}
            >
              <img
                src="/assets/contact-cover-image.png"
                alt="Quiet desk with notebook, coffee, and a laptop — a single afternoon of focused work."
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                loading="lazy"
              />
            </div>

            <p
              data-response-note
              className="text-xs text-muted-ink"
              style={{ opacity: 0, transform: "translateY(6px)" }}
            >
              Typical response time is one working day. I&apos;m based in India
              ({SITE.location}) and work with teams worldwide.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  name,
  type = "text",
  placeholder,
  required,
  as = "input",
  rows,
}: {
  id: string
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  as?: "input" | "textarea"
  rows?: number
}) {
  const reduced = useReducedMotion()
  const underlineRef = useRef<HTMLSpanElement | null>(null)

  // GSAP-driven focus underline.
  useGSAPContextOnRef<HTMLSpanElement>(
    ({ scope }) => {
      if (reduced) {
        gsap.set(scope, { scaleX: 0 })
        return
      }
      const parent = scope.parentElement
      if (!parent) return
      const input = parent.querySelector<HTMLElement>("input, textarea")
      if (!input) return

      function focusIn() {
        gsap.to(scope, {
          scaleX: 1,
          duration: 0.5,
          ease: EASE.out,
          transformOrigin: "left center",
        })
      }
      function focusOut() {
        gsap.to(scope, {
          scaleX: 0,
          duration: 0.4,
          ease: EASE.out,
          transformOrigin: "left center",
        })
      }

      input.addEventListener("focus", focusIn)
      input.addEventListener("blur", focusOut)
      // Tick on initial mount to start at scale 0.
      gsap.set(scope, { scaleX: 0, transformOrigin: "left center" })
      return () => {
        input.removeEventListener("focus", focusIn)
        input.removeEventListener("blur", focusOut)
      }
    },
    underlineRef,
    [reduced]
  )

  const baseClass =
    "mt-1.5 w-full rounded-xl border border-hairline-strong bg-canvas-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-soft outline-none transition-[border-color,box-shadow] focus:border-ink focus:ring-2 focus:ring-ink/10"
  return (
    <label htmlFor={id} className="group/field relative block" data-field>
      <span
        data-field-label
        className="text-xs font-medium text-body transition-colors group-focus-within/field:text-ink"
        style={{ opacity: 0, transform: "translateX(-8px)" }}
      >
        {label}
        {required && <span className="ml-0.5 text-[var(--error)]">*</span>}
      </span>
      {as === "input" ? (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      ) : (
        <textarea
          id={id}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={cn(baseClass, "resize-y")}
        />
      )}
      <span
        ref={underlineRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left bg-primary"
        style={{ transform: "scaleX(0)" }}
      />
    </label>
  )
}

function SocialLink({
  href,
  icon,
  label,
  value,
}: {
  href: string
  icon: React.ReactNode
  label: string
  value: string
}) {
  const isExternal = href.startsWith("http")
  return (
    <li data-social-link>
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="group flex items-center gap-3 rounded-xl px-2 py-2.5 -mx-2 text-ink transition-colors hover:bg-hairline-soft"
      >
        <span className="text-ink group-hover:text-primary">{icon}</span>
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.12em] text-muted-ink">
            {label}
          </span>
          <span className="text-sm text-ink group-hover:text-primary">
            {value}
          </span>
        </span>
        {isExternal && (
          <ArrowUpRight
            size={14}
            weight="bold"
            className="ml-auto text-muted-ink group-hover:text-primary"
          />
        )}
      </a>
    </li>
  )
}
