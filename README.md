# Karan Kushawaha — Portfolio

A modern, editorial developer portfolio built with **Vite**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **GSAP**. Features a day/night hero, a live keyless visitor-location widget, an editorial design system, a premium infinite-marquee practice strip, a 3D-tilt project showcase, and choreographed scroll animations across every section.

🌐 **Live:** https://portfolio-ochre-nu-74.vercel.app
💼 **Developer:** Karan Kushawaha — Full Stack Developer
🏢 **Currently:** Software Developer @ Shubham Infotech, Varanasi
📧 **Contact:** kmkaranmaurya767@gmail.com
📄 **Resume:** [Download PDF](https://github.com/karanmaurya767/karanmaurya767/raw/main/Karan_Kushawaha_Resume.pdf)

---

## ✨ Features

- 🌗 **Interactive day/night hero** — day and night poster imagery with smooth choreographed crossfade.
- 📍 **Live visitor location** — keyless IP geolocation via `ipwho.is` (no API token required).
- 📊 **Animated stats widget** — 11+ projects, 4 categories, 1+ year, 16 repos — counts up on mount with reduced-motion support.
- 🎨 **Editorial design system** — warm cream canvas, hairline borders (no shadows), display type, one orange accent.
- 🟧 **Premium infinite marquee practice strip** — two opposite-direction GSAP tracks with seamless looping, custom line icons, cycling separators, hover-pause, per-item scale/icon lift, and subtle parallax.
- 🪟 **Selected Work — 3D-tilt project showcase** — 11 production projects in a duplicated auto-scroll strip. Each card has 3D tilt, inner-image parallax, cursor spotlight, brand-tinted glow halo, sheen sweep, staggered entrance, and a scroll-driven showcase mode on desktop.
- 🧩 **Capabilities** — three practice cards (Backend, Frontend, DevOps) with hand-crafted animated SVG icons (hover-pause built in).
- 🪜 **Approach**, faux code-editor **Stack**, **About** + **Contact** sections.
- 🧲 **Magnetic CTAs** — header and hero buttons follow the cursor within a calm radius.
- 🟥 **Scroll progress bar** — a hairline progress strip at the top of the viewport.
- 🧭 **Scroll-aware header** with mobile menu drawer, media-backed footer.
- 📩 **Working contact form** — opens the user's email client with a pre-filled message (no backend required).
- 🧪 **Reduced motion everywhere** — every animation has a `prefers-reduced-motion` fallback.
- 📱 **Fully responsive** and content-centralized for easy edits.

---

## 🛠️ Tech Stack

| Layer | Tools |
| --- | --- |
| Build | Vite 5 |
| Framework | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Animation | GSAP 3 (ScrollTrigger, ScrollToPlugin) + Motion 12 |
| Icons | @phosphor-icons/react |
| Fonts | Geist + Geist Mono (Google Fonts `<link>`) |

Free GSAP plugins only — no Club GreenSock license required. The paid plugins are wired into `lib/gsap-setup.ts` but commented out so they can be opted-in later.

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20.9+** (or Bun 1.2+)
- npm / pnpm / yarn / bun

### Install & run

```bash
# 1. Clone
git clone https://github.com/karanmaurya767/portfolio.git
cd portfolio

# 2. Install dependencies
npm install        # or: pnpm install / yarn / bun install

# 3. Start the dev server
npm run dev        # or: pnpm dev / yarn dev / bun dev

# 4. Open http://localhost:5173
```

No `.env` file is needed — the location widget uses free, keyless services.

### Other scripts

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```

---

## 📁 Project Structure

```
portfolio/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx                       # Composes every section
│   ├── index.css                     # Tailwind v4 entry + editorial design tokens
│   ├── components/
│   │   ├── site-header.tsx           # Scroll-aware header + mobile menu
│   │   ├── site-footer.tsx           # Media-backed footer
│   │   ├── hero.tsx                  # Day/night hero with floating widgets
│   │   ├── hero-media.tsx            # Hero image crossfade
│   │   ├── day-night-switch.tsx
│   │   ├── hero-widgets.tsx          # Lazy-loads the two floating widgets
│   │   ├── practice-strip.tsx        # Premium GSAP infinite marquee
│   │   ├── selected-work.tsx         # 3D-tilt project showcase
│   │   ├── capabilities.tsx          # 3 cards + animated SVG icons
│   │   ├── capability-icons.tsx
│   │   ├── approach.tsx              # 4-step process
│   │   ├── stack.tsx                 # Editor-mockup panes
│   │   ├── about.tsx                 # Bio + meta list
│   │   ├── contact.tsx               # Form + socials + cover image
│   │   ├── section-heading.tsx       # Reusable animated heading
│   │   ├── reveal.tsx                # Scroll-reveal helper (Motion)
│   │   ├── scroll-progress.tsx       # Top scroll progress bar
│   │   ├── magnetic-button.tsx       # Magnetic CTA wrapper
│   │   └── widgets/
│   │       ├── visitor-location.tsx  # Keyless IP geolocation
│   │       └── quick-stats.tsx       # Animated stat card
│   └── lib/
│       ├── content.ts                # ALL site copy (nav, projects, capabilities, …)
│       ├── gsap-setup.ts             # GSAP plugin registration (SSR-safe)
│       ├── gsap-utils.ts             # Durations, easings, reveal helpers
│       ├── gsap-matchmedia.ts        # Responsive GSAP hook
│       ├── capability-icons.tsx
│       └── utils.ts                  # cn() class merger
├── hooks/
│   ├── use-gsap-context.ts           # Cleanup-safe gsap.context hook
│   └── use-reduced-motion.ts         # prefers-reduced-motion (live)
└── public/
    └── assets/                       # Hero posters, project images, contact cover
```

> **Path aliases:** `@/components/*`, `@/lib/*`, `@/hooks/*` are wired through `vite-tsconfig-paths` and `tsconfig.json`.

---

## ✏️ Customising the content

Every piece of text the site shows lives in **`src/lib/content.ts`**. Open it and edit:

| Export | Where it shows up |
| --- | --- |
| `SITE` | Name, role, email, socials, hero copy, location |
| `NAV_LINKS` | Header / mobile nav |
| `PRACTICE_AREAS` | Thin infinite marquee under the hero |
| `PROJECTS` | Selected Work showcase |
| `CAPABILITIES` | 3 practice cards |
| `APPROACH_STEPS` | 4-step process |
| `STACK_PANES` | Editor-mockup panes |
| `ABOUT_META` | About list |
| `FOOTER_COLUMNS` | Footer links |
| `QUICK_STATS` | Animated stat card |

To swap the social links, edit `SITE.github` / `SITE.linkedin` / `SITE.twitter` and the matching entries in `FOOTER_COLUMNS`. To change the project images, drop new files into `public/assets/projects/` and update each `image` path in `PROJECTS`.

---

## 🎨 Design system

The editorial design tokens live in `src/index.css` under `:root` and `@theme inline`. The palette is intentionally restrained:

- **Surfaces:** warm cream canvas (`--canvas: #f7f7f4`) — never pure white.
- **Hairlines:** 1px borders at 3 depths (`--hairline`, `--hairline-soft`, `--hairline-strong`) — no drop shadows.
- **Type:** warm near-black ink on cream, with a single orange accent (`--primary: #f54e00`).
- **Overlay pair:** light cream type on dark ink scrim — used in the hero scrim and the media-backed footer.

To re-skin the site, change the values inside `:root` in `index.css`. Every component reads these via Tailwind theme tokens (`bg-canvas`, `border-hairline`, `text-ink`, `bg-primary`, …).

---

## 🎬 Motion conventions

All animations live behind GSAP contexts so they're cleaned up on unmount or unmount-via-dep-change. The shared hook is `useGSAPContext` in `hooks/use-gsap-context.ts`.

- **Durations** — `DUR.fast / base / slow` in `lib/gsap-utils.ts`.
- **Easings** — `EASE.out` (expo) for entrances, `EASE.inOut` (power3) for transitions, `EASE.back` for elastic beats.
- **Reusable helpers** — `splitChars`, `splitWords`, `revealHeadline`, `revealText`, `tickUnderline` in `lib/gsap-utils.ts`.
- **Responsive GSAP** — `useMatchMedia` in `lib/gsap-matchmedia.ts` wraps `gsap.matchMedia()` for breakpoint-branched animations.
- **Reduced motion** — every component reads `useReducedMotion()` and short-circuits to a static layout.

---

## 🌍 Deploying

The easiest path is **Vercel**:

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Vite — no config needed. No environment variables required.
4. Build command: `npm run build` · Output: `dist/`

Other static hosts (Cloudflare Pages, Netlify, GitHub Pages) work too — the build output is a standard Vite SPA.

---

## 📜 License

MIT — use it for whatever you want, attribution appreciated but not required.

---

## 🙏 Credits

- Original portfolio tutorial starter by [CodeBucks](https://github.com/codebucks27) — this started as a fork of his Next.js portfolio tutorial.
- Day/night hero, visitor-location widget, stats widget, animations, marquee, 3D-tilt showcase, contact form, footer, and the entire Vite + GSAP migration were implemented on top of it.
- Content personalised and adapted by **Karan Kushawaha** — Full Stack Developer based in Varanasi, India. All project copy, capabilities, stack, and about copy now reflect real production work.
