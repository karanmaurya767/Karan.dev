import { writeFileSync } from 'node:fs'
export default async function run(page) {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 200,
    downloadThroughput: 50 * 1024 / 8,
    uploadThroughput: 50 * 1024 / 8,
  })
  await page.goto('http://localhost:3003/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  // Probe DOM state first.
  const state = await page.evaluate(() => {
    const root = document.querySelector('div.fixed.inset-0')
    const inputs = document.querySelectorAll('span.font-mono')
    const progressSpan = Array.from(inputs).find(s => /^\d{3}$/.test(s.textContent || ''))
    const numText = progressSpan?.textContent ?? null
    const fill = document.querySelector('div[style*="scaleX"]')
    const fillScale = fill ? (fill.style.transform || getComputedStyle(fill).transform) : null
    return {
      loaderRootFound: !!root,
      loaderAriaHidden: root?.getAttribute('aria-hidden') ?? null,
      progressText: numText,
      fillTransform: fillScale,
      bodyHasLoading: document.body.innerText.includes('Loading'),
    }
  })
  // Save to a temp path that doesn't need a scheme, then we'll move it.
  const tmp = await page.screenshot({ path: 'C:/Users/Admin/Desktop/karan_dev/review-loader-mid.png' })
  return { shotBytes: tmp.length, ...state }
}
