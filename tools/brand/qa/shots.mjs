/**
 * QA screenshot harness (dev tool only, not part of the app).
 * Uses a real Chromium so framer-motion animations complete naturally.
 * Usage: node tools/brand/qa/shots.mjs
 */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'fs'

const EXE =
  'C:/Users/Abdulrahman/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'
const BASE = 'http://localhost:8778'
const OUT = 'tools/brand/qa'

mkdirSync(OUT, { recursive: true })

const run = async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true })

  // Desktop pass
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4500) // let entry animations finish
  await page.screenshot({ path: OUT + '/r_hero.png' })

  const sections = ['about', 'services', 'why', 'how', 'film', 'owner', 'faq', 'contact']
  for (const id of sections) {
    const el = page.locator('#' + id)
    if ((await el.count()) === 0) {
      console.log('MISSING SECTION #' + id)
      continue
    }
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1200)
    await el.screenshot({ path: `${OUT}/r_${id}.png` })
  }

  // Full page (scroll through so lazy animations trigger, then capture)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
  await page.screenshot({ path: OUT + '/r_full.png', fullPage: true })

  // Mobile pass
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mob.goto(BASE + '/', { waitUntil: 'networkidle' })
  await mob.waitForTimeout(4500)
  await mob.screenshot({ path: OUT + '/r_mobile_hero.png' })
  await mob.screenshot({ path: OUT + '/r_mobile_full.png', fullPage: true })

  // Console errors check
  const errors = []
  const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  p3.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  p3.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  await p3.goto(BASE + '/', { waitUntil: 'networkidle' })
  await p3.waitForTimeout(3000)
  console.log('CONSOLE ERRORS:', errors.length ? errors.join('\n') : 'none')

  await browser.close()
  console.log('DONE')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
