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

// Số bản vẽ bố cục (格局) ở đầu album của lần đọc gần nhất — dùng cho script sắp xếp lại ảnh cũ
export let lastLayoutCount = 0

// Trả về tối đa `max` URL ảnh lớn của tin nhà (ảnh đầu tiên là ảnh bìa)
export async function collectListingImages(url: string, max = 30): Promise<string[]> {
  const browser = await launch()
  try {
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36")
    const isYC = /yungching\.com\.tw/.test(url)
    if (isYC) {
      // Chỉ đọc dãy ảnh thu nhỏ (đúng thứ tự album). Album 永慶: các ảnh đầu thuộc tab 格局 (bản vẽ bố cục),
      // trang mở sẵn ở ảnh đầu tiên của tab 照片 -> số thứ tự hiện tại (vd "2/15") cho biết có bao nhiêu bản vẽ.
      const SEL = ".yc-ng-album-v2-carousel__thumb img"
      let srcs: string[] = [], layoutCount = 0
      // Thử tối đa 2 lần (đôi khi album tải chậm trên máy chủ)
      for (let attempt = 0; attempt < 2 && srcs.length < 2; attempt++) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {})
        await page.waitForSelector(SEL, { timeout: 20000 }).catch(() => {})
        await new Promise(r => setTimeout(r, 1500))
        srcs = await page.$$eval(SEL, els => els.map(e => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src)).catch(() => [])
        layoutCount = await page.evaluate(() => {
          const tabs = Array.from(document.querySelectorAll(".yc-ng-album-v2-switch-bar__switch-item"))
          const hasLayout = tabs.some(t => (t.textContent || "").includes("格局"))
          const photoTab = tabs.find(t => (t.textContent || "").includes("照片"))
          const cur = Number((document.querySelector(".yc-ng-album-v2-switch-bar__page")?.textContent || "").split("/")[0])
          return hasLayout && photoTab?.getAttribute("aria-selected") === "true" && cur > 1 ? cur - 1 : 0
        }).catch(() => 0)
      }
      const seen = new Set<string>(), ordered: { src: string; layout: boolean }[] = []
      srcs.forEach((s, i) => {
        if (!/yccdn\.yungching\.com\.tw\/v1\/image\//.test(s)) return
        const k = yccdnKey(s)
        if (seen.has(k)) return
        seen.add(k)
        const src = (s.startsWith("//") ? "https:" + s : s).replace(/&width=\d+/, "&width=1024").replace(/&height=\d+/, "&height=768")
        ordered.push({ src, layout: i < layoutCount })
      })
      lastLayoutCount = layoutCount
      // Ảnh thật lên trước, bản vẽ bố cục xếp cuối album
      const photos = ordered.filter(o => !o.layout).map(o => o.src)
      const layouts = ordered.filter(o => o.layout).map(o => o.src)
      return [...photos.slice(0, Math.max(1, max - layouts.length)), ...layouts].slice(0, max)
    }
    // Trang khác: lấy các ảnh lớn đang hiển thị
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {})
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
