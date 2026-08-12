// Every bit of text/data the site shows lives here, so our components stay clean and easy to re-skin.

/**
 * Centralized site copy.
 *
 * This file holds the repeating, list-shaped content rendered across the
 * portfolio — nav links, projects, capabilities, the stack, footer columns,
 * and so on. One-off strings (headlines, section intros, CTA labels) stay
 * inline in their components; only data with a repeating pattern lives here so
 * it's easy to edit, translate, or hand off in one place.
 *
 * Each export is consumed by the component named in its comment.
 */

// --- Site identity --------------------------------------------------------
export const SITE = {
  name: "Karan Kushawaha",
  shortName: "Karan",
  role: "Full Stack Developer · Laravel & Flask Specialist",
  location: "Varanasi, Uttar Pradesh, India · GMT +5:30",
  email: "kmkaranmaurya767@gmail.com",
  emailShort: "kmkaranmaurya767",
  github: "https://github.com/karanmaurya767",
  githubHandle: "karanmaurya767",
  linkedin: "https://www.linkedin.com/in/karanmaurya767",
  twitter: "https://x.com/Nagumi38748",
  resumeUrl:
    "https://github.com/karanmaurya767/karanmaurya767/raw/main/Karan_Kushawaha_Resume.pdf",
  // Hero headline copy.
  heroEyebrow: "Available for new opportunities · Open to work",
  heroTitle: "Building production web apps that ship.",
  heroSubtitle:
    "I'm Karan Kushawaha — a Full Stack Developer based in Varanasi, India. Currently building at Shubham Infotech. I design, develop, and deploy scalable web applications end-to-end: from database schema and backend APIs to polished, responsive interfaces.",
  heroCtaPrimary: "See selected work",
  heroCtaSecondary: "Start a project",
  heroCtaResume: "Download resume",
} as const

// --- Site header ----------------------------------------------------------
// components/site-header.tsx — primary + mobile nav.
export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Approach", href: "#process" },
  { label: "Stack", href: "#stack" },
  { label: "About", href: "#about" },
] as const

// --- Practice strip -------------------------------------------------------
// components/practice-strip.tsx — the thin band of practice areas.
export const PRACTICE_AREAS = [
  { k: "01", v: "MLM & Network Platforms" },
  { k: "02", v: "E-commerce Solutions" },
  { k: "03", v: "NGO & Social Portals" },
  { k: "04", v: "Student Management" },
  { k: "05", v: "Animated Frontends" },
] as const

// --- Selected work --------------------------------------------------------
// components/selected-work.tsx — the project carousel.
export type Project = {
  index: string
  title: string
  description: string
  year: string
  status: string
  metrics?: readonly string[]
  tags: readonly string[]
  href: string
  image: string
  imageAlt: string
}

export const PROJECTS: readonly Project[] = [
  {
    index: "01",
    title: "FS Foundation — NGO Platform",
    description:
      "A complete charity & welfare platform for Flowing Stream Foundation. Built member management, donation flow, success stories, and admin dashboard for a registered non-profit operating in Bihar.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Registered NGO", "7+ service verticals", "Full admin panel"],
    tags: ["Laravel", "MySQL", "PHP", "Tailwind CSS"],
    href: "https://fsfoundations.com",
    image: "/assets/projects/fs-foundations.svg",
    imageAlt:
      "FS Foundation homepage showing hero slider, services grid, and donation call-to-action for the registered charity.",
  },
  {
    index: "02",
    title: "Nilexuma — Jewellery & Finance",
    description:
      "Jewellery e-commerce + financial services platform. Built product catalog, member area, and governance content. A real customer-facing product with active inventory and member accounts.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Product catalog", "Member accounts", "Governance pages"],
    tags: ["Laravel", "MySQL", "PHP", "Bootstrap"],
    href: "https://nilexuma.com",
    image: "/assets/projects/nilexuma.svg",
    imageAlt:
      "Nilexuma Services homepage with jewellery branding, about section, and quick-links to product categories.",
  },
  {
    index: "03",
    title: "Pragati — MLM Member Portal",
    description:
      "Multi-level marketing platform with role-based admin/member login, commission tracking, and member ID system. Built the full authentication flow and dashboard structure for distributor network operations.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Role-based auth", "MLM logic", "Member dashboard"],
    tags: ["Laravel", "MySQL", "AJAX", "REST APIs"],
    href: "https://pragati.mbizz.in",
    image: "/assets/projects/pragati.svg",
    imageAlt:
      "Pragati Marketing login page with admin/member access, quick-login demo credentials, and modern card-based layout.",
  },
  {
    index: "04",
    title: "VedaCare — Member Portal",
    description:
      "Member management system for an organic-products e-commerce platform. Built secure authentication, remember-me flow, and member area for the customer base.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Auth + sessions", "Member ID login", "Forgot password"],
    tags: ["Laravel", "MySQL", "Bootstrap", "Sessions"],
    href: "https://vedacare.mbizz.in",
    image: "/assets/projects/vedacare.svg",
    imageAlt:
      "VedaCare login interface with member ID/email field, password input, and branded organic-products identity.",
  },
  {
    index: "05",
    title: "Bhudev — NGO Welfare Portal",
    description:
      "Public charity portal for Bhudev Human Welfare Foundation. Built team management, member directory, donation flows, and event tracking for a registered welfare organization.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Team directory", "Donation flow", "Event tracking"],
    tags: ["Laravel", "MySQL", "cPanel", "AJAX"],
    href: "https://bhudev.mbizz.in",
    image: "/assets/projects/bhudev.svg",
    imageAlt:
      "Bhudev Human Welfare Foundation homepage with hero slider, team grid, core values, and donation call-to-action.",
  },
  {
    index: "06",
    title: "ShineOnCare — NGO Platform",
    description:
      "Charity platform for Shine On Care Foundation. Built donor tracking, event management, gallery system, and a live stats dashboard showing total donors, raised funds, and ongoing events.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Live stats", "Event system", "Donor tracking"],
    tags: ["Laravel", "MySQL", "PHP", "cPanel"],
    href: "https://shineoncare.mbizz.in",
    image: "/assets/projects/shineoncare.svg",
    imageAlt:
      "ShineOnCare Foundation homepage with live donor count, raised funds counter, and upcoming events calendar.",
  },
  {
    index: "07",
    title: "Sri Krishna Foundation — Institute",
    description:
      "Educational institute portal for Shree Krishna Foundation. Built course listings, online applications, student zone, exam portal, and accreditation display for a registered society.",
    year: "2025",
    status: "Live · Production",
    metrics: ["Society registered", "Student portal", "Online admissions"],
    tags: ["Laravel", "MySQL", "Admin Panel", "cPanel"],
    href: "https://srikrishnafoundation.com",
    image: "/assets/projects/srikrishna.svg",
    imageAlt:
      "Sri Krishna Foundation educational institute portal with course listings, accreditation badges, and student zone links.",
  },
  {
    index: "08",
    title: "Pi Brains — Healthcare Agency Site",
    description:
      "Marketing & inquiry website for Pi Brains — a healthcare-focused web/software agency I co-built. Includes interactive feature showcase, pricing tiers, and a consultation-request flow with email dispatch.",
    year: "2024",
    status: "Live · Production",
    metrics: ["Agency site", "Pricing tiers", "Consultation form"],
    tags: ["React", "Next.js", "GSAP", "Custom CSS"],
    href: "https://pibrains.com",
    image: "/assets/projects/pibrains.svg",
    imageAlt:
      "Pi Brains healthcare agency homepage with hero section, value props, and consultation CTA for doctor/clinic clients.",
  },
  {
    index: "09",
    title: "Wiserfox — Loan Services",
    description:
      "Marketing site for Wiserfox Business Solutions — a loan & e-filing services company. Built team showcase, services catalog, enquiry form, and client testimonials.",
    year: "2024",
    status: "Live · Production",
    metrics: ["6 loan services", "3 e-filing flows", "Enquiry form"],
    tags: ["HTML", "CSS", "JavaScript", "cPanel"],
    href: "https://wiserfox.co.in",
    image: "/assets/projects/wiserfox.svg",
    imageAlt:
      "Wiserfox Business Solutions homepage with loan services catalog, e-filing offerings, and enquiry form.",
  },
  {
    index: "10",
    title: "Flask EMS — Employee Management",
    description:
      "Full-featured Employee Management System built with Python Flask. CRUD operations, SQLAlchemy ORM, MySQL persistence, user authentication, session management. Demonstrates recent Python/Flask work.",
    year: "2026",
    status: "Live · v1.0",
    metrics: ["CRUD + auth", "MySQL backend", "Deployed on Vercel"],
    tags: ["Python", "Flask", "SQLAlchemy", "MySQL"],
    href: "https://flask-app-indol-one.vercel.app/",
    image: "/assets/projects/flask-ems.svg",
    imageAlt:
      "Flask EMS dashboard with employee list, add/edit forms, and authentication flow built with Python and Flask.",
  },
  {
    index: "11",
    title: "FocusFlow — Pomodoro Timer",
    description:
      "Minimal Pomodoro-style focus timer. Vanilla JavaScript, HTML5, CSS3 — no framework, no build step. Live on Vercel. A small utility I built for daily use.",
    year: "2025",
    status: "Live · v1.0",
    metrics: ["Zero dependencies", "Mobile responsive", "Live on Vercel"],
    tags: ["JavaScript", "HTML5", "CSS3", "Vercel"],
    href: "https://focus-flow-roan-five.vercel.app",
    image: "/assets/projects/focusflow.svg",
    imageAlt:
      "FocusFlow Pomodoro timer interface with start/pause controls, session count, and clean minimal design.",
  },
]

// --- Capabilities ---------------------------------------------------------
// components/capabilities.tsx — the three practice cards. Cards map to the
// icons in components/capability-icons.tsx by position.
export const CAPABILITIES = [
  {
    num: "— 01",
    title: "Backend & Database",
    body: "Production-grade server logic with clean architecture, optimized queries, and rock-solid data integrity. Built for real user load, not just demos.",
    items: [
      "Laravel",
      "PHP",
      "Flask",
      "Python",
      "MySQL",
      "REST APIs",
      "MVC Architecture",
    ],
  },
  {
    num: "— 02",
    title: "Frontend & UI",
    body: "Responsive, accessible interfaces with calm typography and considered motion. Tailwind-first workflows with hand-tuned CSS where it matters.",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript ES6+",
      "Tailwind CSS",
      "Bootstrap",
      "GSAP",
      "AOS Animation",
    ],
  },
  {
    num: "— 03",
    title: "DevOps & Deployment",
    body: "Version control, hosting, and shipping pipelines that don't get in the way. From local development to production, every step is reproducible.",
    items: [
      "Git & GitHub",
      "Vercel",
      "cPanel",
      "AWS S3",
      "XAMPP",
      "HeidiSQL",
      "Postman",
    ],
  },
] as const

// --- Approach -------------------------------------------------------------
// components/approach.tsx — the four ordered process steps.
export const APPROACH_STEPS = [
  {
    k: "— Step 01",
    t: "Understand the requirement",
    d: "Before any code, I sit with the client to understand the business problem, the users, and the success criteria. What does this product change for the people using it?",
  },
  {
    k: "— Step 02",
    t: "Design the data layer",
    d: "Database schemas, relationships, and API contracts get drafted first. This forces clarity on what the system actually does, before we touch the UI.",
  },
  {
    k: "— Step 03",
    t: "Build the backend & APIs",
    d: "Laravel or Flask endpoints with proper validation, authentication, and error handling. Each route tested with Postman before the frontend sees it.",
  },
  {
    k: "— Step 04",
    t: "Ship the polished frontend",
    d: "Responsive, animated, accessible UI built with Tailwind. Tested across devices, deployed via Vercel or cPanel, and monitored post-launch.",
  },
] as const

// --- Stack ----------------------------------------------------------------
// components/stack.tsx — the editor-mockup panes. Each item is [name, tag].
export const STACK_PANES = [
  {
    title: "Backend",
    items: [
      ["Laravel", "framework"],
      ["PHP", "language"],
      ["Flask", "framework"],
      ["Python", "language"],
      ["MySQL", "database"],
      ["REST APIs", "integration"],
    ],
  },
  {
    title: "Frontend",
    items: [
      ["HTML5 / CSS3", "core"],
      ["JavaScript ES6+", "language"],
      ["TypeScript", "language"],
      ["Tailwind CSS", "styling"],
      ["Bootstrap", "ui-kit"],
      ["GSAP / AOS", "animation"],
    ],
  },
  {
    title: "Tools & Workflow",
    items: [
      ["Git", "version-control"],
      ["GitHub", "remote"],
      ["VS Code", "editor"],
      ["Postman", "api-testing"],
      ["HeidiSQL", "db-client"],
      ["XAMPP", "local-stack"],
    ],
  },
  {
    title: "Deployment",
    items: [
      ["Vercel", "frontend-host"],
      ["cPanel", "shared-host"],
      ["AWS S3", "storage"],
      ["GitHub Actions", "ci-cd"],
      ["Custom Domains", "dns"],
    ],
  },
] as const

// --- About ----------------------------------------------------------------
// components/contact.tsx (About band) — the meta definition list. [key, value].
export const ABOUT_META = [
  ["Based", "Varanasi, UP, India"],
  ["Role", "Full Stack Developer"],
  ["Company", "Shubham Infotech"],
  ["Experience", "1+ year production"],
  ["Education", "BCA (Pursuing 2025-26)"],
  ["Certification", "NIELIT O-Level (Grade C)"],
  ["Speciality", "Laravel + MySQL stacks"],
  ["Availability", "Open to opportunities"],
] as const

// --- Site footer ----------------------------------------------------------
// components/site-footer.tsx — link columns. Each link is [label, href].
export const FOOTER_COLUMNS = [
  {
    title: "Site",
    links: [
      ["Work", "#work"],
      ["Capabilities", "#capabilities"],
      ["Approach", "#process"],
      ["Stack", "#stack"],
      ["About", "#about"],
      ["Contact", "#contact"],
    ],
  },
  {
    title: "Live Projects",
    links: [
      ["FS Foundation", "https://fsfoundations.com"],
      ["Nilexuma", "https://nilexuma.com"],
      ["Pragati", "https://pragati.mbizz.in"],
      ["VedaCare", "https://vedacare.mbizz.in"],
      ["Bhudev NGO", "https://bhudev.mbizz.in"],
      ["ShineOnCare", "https://shineoncare.mbizz.in"],
      ["Sri Krishna", "https://srikrishnafoundation.com"],
      ["Pi Brains", "https://pibrains.com"],
      ["Wiserfox", "https://wiserfox.co.in"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["GitHub", "https://github.com/karanmaurya767"],
      ["LinkedIn", "https://www.linkedin.com/in/karanmaurya767"],
      ["Email", "mailto:kmkaranmaurya767@gmail.com"],
      [
        "Resume PDF",
        "https://github.com/karanmaurya767/karanmaurya767/raw/main/Karan_Kushawaha_Resume.pdf",
      ],
    ],
  },
] as const

// --- Stats widget ---------------------------------------------------------
// components/widgets/usage-stats.tsx — replaced token-usage with real stats.
export type Stat = {
  label: string
  value: string
  hint?: string
}

export const QUICK_STATS: readonly Stat[] = [
  { label: "Projects shipped", value: "11+", hint: "live in production" },
  { label: "Categories", value: "4", hint: "MLM · NGO · Edu · E-com" },
  { label: "Years building", value: "1+", hint: "at Shubham Infotech" },
  { label: "Repos public", value: "16", hint: "on GitHub" },
] as const
