import { useEffect, useRef, useState } from "react"
import { MapPin, Thermometer, Cloud } from "@phosphor-icons/react/dist/ssr"
import { gsap } from "@/lib/gsap-setup"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

type GeoState = {
  city: string
  region: string
  country: string
  tz: string
  tempC: number | null
  condition: string
  loading: boolean
  error: string | null
}

const FALLBACK: GeoState = {
  city: "Bengaluru",
  region: "Karnataka",
  country: "India",
  tz: "Asia/Kolkata",
  tempC: 27,
  condition: "Partly cloudy",
  loading: false,
  error: null,
}

/**
 * VisitorLocation — server-keyless location + weather widget.
 *
 * Premium additions:
 *   - Loading state pulses a dot until data arrives.
 */
export function VisitorLocation() {
  const [state, setState] = useState<GeoState>({ ...FALLBACK, loading: true })
  const loadingDotRef = useRef<HTMLSpanElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const ipRes = await fetch("https://ipwho.is/", { cache: "no-store" })
        const ip = await ipRes.json()
        if (cancelled) return
        if (!ip || ip.success === false) throw new Error("ip lookup failed")

        const lat = ip.latitude
        const lon = ip.longitude
        const city = ip.city || FALLBACK.city
        const region = ip.region || FALLBACK.region
        const country = ip.country || FALLBACK.country
        const tz = ip.timezone?.id || FALLBACK.tz

        let tempC: number | null = null
        let condition = FALLBACK.condition
        if (typeof lat === "number" && typeof lon === "number") {
          const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
            { cache: "no-store" }
          )
          const w = await wRes.json()
          if (!cancelled && w?.current) {
            tempC = Math.round(w.current.temperature_2m)
            condition = wmoText(w.current.weather_code)
          }
        }

        if (!cancelled) {
          setState({
            city,
            region,
            country,
            tz,
            tempC,
            condition,
            loading: false,
            error: null,
          })
        }
      } catch (e) {
        if (!cancelled) {
          setState({ ...FALLBACK, loading: false, error: "Using fallback" })
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Loading dot pulse.
  useEffect(() => {
    if (reduced) return
    const el = loadingDotRef.current
    if (!el) return
    if (state.loading) {
      const tween = gsap.to(el, {
        opacity: 0.2,
        duration: 0.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
      return () => {
        tween.kill()
        gsap.set(el, { opacity: 1 })
      }
    }
  }, [state.loading, reduced])

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-hairline bg-surface-card/80 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-ink">
        <MapPin size={14} weight="duotone" />
        <span>Visitor location</span>
        {state.loading && (
          <span
            ref={loadingDotRef}
            className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden
          />
        )}
        {!state.loading && (
          <span className="ml-auto text-muted-soft">{state.tz}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-medium text-ink">
          {state.city}, {state.country}
        </span>
        <span className="text-xs text-muted-ink">{state.region}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-body">
        <span className="inline-flex items-center gap-1">
          <Thermometer size={14} weight="duotone" />
          {state.tempC !== null ? `${state.tempC}°C` : "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Cloud size={14} weight="duotone" />
          {state.condition}
        </span>
      </div>
    </div>
  )
}

function wmoText(code: number | undefined | null): string {
  if (code == null) return "—"
  if (code === 0) return "Clear"
  if (code === 1 || code === 2) return "Partly cloudy"
  if (code === 3) return "Overcast"
  if (code === 45 || code === 48) return "Fog"
  if (code >= 51 && code <= 57) return "Drizzle"
  if (code >= 61 && code <= 67) return "Rain"
  if (code >= 71 && code <= 77) return "Snow"
  if (code >= 80 && code <= 82) return "Showers"
  if (code === 95) return "Thunderstorm"
  if (code === 96 || code === 99) return "Storm"
  return "—"
}
