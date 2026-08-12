import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/hero"
import { PracticeStrip } from "@/components/practice-strip"
import { SelectedWork } from "@/components/selected-work"
import { Capabilities } from "@/components/capabilities"
import { Approach } from "@/components/approach"
import { Stack } from "@/components/stack"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { ScrollProgress } from "@/components/scroll-progress"
import { MagneticButtons } from "@/components/magnetic-button"
import { PageLoader } from "@/components/page-loader"

export function App() {
  return (
    <>
      <PageLoader />
      <ScrollProgress />
      <MagneticButtons />
      <SiteHeader />
      <main>
        <Hero />
        <PracticeStrip />
        <SelectedWork />
        <Capabilities />
        <Approach />
        <Stack />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}