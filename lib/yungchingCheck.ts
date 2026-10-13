// lib/yungchingCheck.ts
// Kiểm tra 1 link tin trên buy.yungching.com.tw còn đang rao hay đã bị gỡ.
//
// Nguyên tắc AN TOÀN: chỉ kết luận "gone" khi 永慶 trả HTTP 404 VÀ tiêu đề trang là trang báo lỗi của tin
// (vd "物件不存在", "物件已下架"). Mọi tình huống khác — 403/429 (bị chặn), 5xx, hết giờ, lỗi mạng,
// bị chuyển hướng sang trang khác, trang lạ — đều là "unknown": KHÔNG được gỡ tin trên website.

export type YcState = "live" | "gone" | "unknown"
export interface YcResult { state: YcState; status?: number; detail?: string }

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept-Language": "zh-TW,zh;q=0.9",
}

// Dựng chuỗi Hán từ mã Unicode để file không phụ thuộc bảng mã khi chỉnh sửa/sao chép
const w = (...codes: number[]) => String.fromCharCode(...codes)
// Tiêu đề trang lỗi của tin: 不存在 | 已下架 | 已成交 | 已售出 | 已失效 | 已出售
const GONE_TITLE = new RegExp([
  w(0x4e0d, 0x5b58, 0x5728), w(0x5df2, 0x4e0b, 0x67b6), w(0x5df2, 0x6210, 0x4ea4),
  w(0x5df2, 0x552e, 0x51fa), w(0x5df2, 0x5931, 0x6548), w(0x5df2, 0x51fa, 0x552e),
].join("|"))
// Nút "預約賞屋" — chỉ có trên trang tin đang rao
const BOOK_BUTTON = w(0x9810, 0x7d04, 0x8cde, 0x5c4b)

export async function checkYungchingUrl(url: string, timeoutMs = 20000): Promise<YcResult> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow", signal: ctl.signal, cache: "no-store" })
    const html = await res.text()
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ""
    const stillHouseUrl = /\/house\/\d+/.test(res.url)

    if (res.status === 200 && stillHouseUrl && html.includes(BOOK_BUTTON)) return { state: "live", status: 200 }
    if (res.status === 404 && GONE_TITLE.test(title)) return { state: "gone", status: 404 }
    return { state: "unknown", status: res.status, detail: stillHouseUrl ? "trang không nhận diện được" : `chuyển hướng tới ${res.url}` }
  } catch (e: any) {
    return { state: "unknown", detail: e?.name === "AbortError" ? "hết thời gian chờ" : String(e?.message || e) }
  } finally {
    clearTimeout(timer)
  }
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// Chạy `fn` cho từng phần tử với tối đa `limit` tác vụ song song
export async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++]
      await fn(item)
    }
  })
  await Promise.all(workers)
}
