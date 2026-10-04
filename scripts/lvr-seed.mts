// Nạp dữ liệu 實價登錄 từ máy local (dùng khi cần nạp lại nhiều quý cũ).
// Chạy: node --env-file=.env.local scripts/lvr-seed.mts [115S2 115S1 ...] [--force]
// Không có tham số quý -> chỉ nạp kỳ hiện tại.
// @ts-expect-error -- Node chạy trực tiếp file .ts (type stripping), Next/tsc không cần đuôi .ts
import { syncLvr } from "../lib/lvr.ts"

const args = process.argv.slice(2)
const force = args.includes("--force")
const seasons = args.filter(a => /^\d{3}S[1-4]$/.test(a))
const token = process.env.LVR_INGEST_TOKEN
if (!token) { console.error("Thiếu LVR_INGEST_TOKEN trong .env.local"); process.exit(1) }

for (const s of seasons.length ? seasons : [undefined]) {
  const t0 = Date.now()
  const r = await syncLvr({ season: s, force, token })
  console.log(JSON.stringify(r), `${((Date.now() - t0) / 1000).toFixed(1)}s`)
}
