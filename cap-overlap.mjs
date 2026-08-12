export default async function run(page) {
  // Throttle so the loader stays put long enough to inspect hero state.
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', {
    offline: false, latency: 200,
    downloadThroughput: 200 * 1024 / 8,
    uploadThroughput: 200 * 1024 / 8,
  })
  await page.goto('http://localhost:3003/', { waitUntil: 'domcontentloaded' })
  // Frame A: 1.2s into entrance — title reveal should be mid-flight.
  await page.waitForTimeout(1200)
  const a = await page.evaluate(() => {
    const title = document.querySelector('h1')
    const subtitle = document.querySelector('main p')
    const chars = Array.from(document.querySelectorAll('h1 > * > span, h1 > span, h1 span'))
    const charRects = chars.slice(0, 6).map(c => {
      const r = c.getBoundingClientRect()
      return { text: c.textContent.slice(0, 12), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), opacity: getComputedStyle(c).opacity, transform: c.style.transform }
    })
    const subRect = subtitle?.getBoundingClientRect()
    return {
      titleOpacity: title ? getComputedStyle(title).opacity : null,
      titleY: title ? title.style.transform : null,
      subTop: subRect ? Math.round(subRect.top) : null,
      subLeft: subRect ? Math.round(subRect.left) : null,
      subWidth: subRect ? Math.round(subRect.width) : null,
      subHeight: subRect ? Math.round(subRect.height) : null,
      charCount: chars.length,
      charSample: charRects,
    }
  })
  // Frame B: 2.5s — entrance fully done.
  await page.waitForTimeout(1300)
  const b = await page.evaluate(() => {
    const title = document.querySelector('h1')
    const subtitle = document.querySelector('main p')
    const tRect = title?.getBoundingClientRect()
    const sRect = subtitle?.getBoundingClientRect()
    return {
      titleBottom: tRect ? Math.round(tRect.bottom) : null,
      subTop: sRect ? Math.round(sRect.top) : null,
      overlap: (tRect && sRect) ? Math.round(tRect.bottom - sRect.top) : null,
    }
  })
  await page.screenshot({ path: 'C:/Users/Admin/Desktop/karan_dev/review-overlap.png' })
  return { frameA: a, frameB: b }
}
