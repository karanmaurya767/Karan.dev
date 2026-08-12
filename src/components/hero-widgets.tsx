import { VisitorLocation } from "@/components/widgets/visitor-location"
import { QuickStats } from "@/components/widgets/quick-stats"

export function HeroWidgets({ kind }: { kind: "location" | "usage" }) {
  if (kind === "location") {
    return <VisitorLocation />
  }
  return <QuickStats />
}