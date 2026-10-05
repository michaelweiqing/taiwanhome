// lib/renderPage.ts
// Mở link tin nhà bằng trình duyệt Chromium (giống người xem bình thường) để lấy danh sách ảnh
// mà trang hiển thị trong album. Dùng cho trang 永慶 (ảnh album chỉ hiện sau khi trang chạy JavaScript)
// và các trang khác. Chạy trên Vercel bằng @sparticuz/chromium; chạy local thì dùng Chrome cài sẵn.
import type { Browser } from "puppeteer-core"

const LOCAL_CHROME = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].filter(Boolean) as string[]

async function launch(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default
    return puppeteer.launch({
      args: chromium.args, executablePath: await chromium.executablePath(), headless: true,
      defaultViewport: { width: 1280, height: 900 },
    })
  }
  const fs = await import("fs")
  const exe = LOCAL_CHROME.find(p => fs.existsSync(p))
  if (!exe) throw new Error("Không tìm thấy Chrome trên máy")
  return puppeteer.launch({ executablePath: exe, headless: true, defaultViewport: { width: 1280, height: 900 } })
}

const yccdnKey = (u: string) => u.match(/[?&]key=([^&]+)/)?.[1] || u

// Trả về tối đa `max` URL ảnh lớn của tin nhà (ảnh đầu tiên là ảnh bìa)
export async function collectListingImages(url: string, max = 12): Promise<string[]> {
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36")
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
    const isYC = /yungching\.com\.tw/.test(page.url())
    if (isYC) {
      await page.waitForSelector(".yc-ng-album-v2-carousel__thumb img, .yc-ng-album-v2-carousel__main-img img", { timeout: 10000 }).catch(() => {})
      const srcs: string[] = await page.$$eval(
        ".yc-ng-album-v2-carousel__thumb img, .yc-ng-album-v2-carousel__main-img img",
        els => els.map(e => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src))
      const seen = new Set<string>(), out: string[] = []
      for (const s of srcs) {
        if (!/yccdn\.yungching\.com\.tw\/v1\/image\//.test(s)) continue
        const k = yccdnKey(s)
        if (seen.has(k)) continue
        seen.add(k)
        out.push(s.replace(/&width=\d+/, "&width=1024").replace(/&height=\d+/, "&height=768"))
      }
      return out.slice(0, max)
    }
    // Trang khác: lấy các ảnh lớn đang hiển thị
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {})
    await new Promise(r => setTimeout(r, 1500))
    const big: string[] = await page.$$eval("img", els => els
      .map(e => e as HTMLImageElement)
      .filter(i => i.naturalWidth >= 500 && i.naturalHeight >= 300)
      .map(i => i.currentSrc || i.src))
    return [...new Set(big)].filter(s => /^https?:/.test(s)).slice(0, max)
  } finally {
    await browser.close().catch(() => {})
  }
}
