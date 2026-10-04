// app/gia-thi-truong/page.tsx
// 實價登錄 — Tra cứu giá giao dịch thực tế (mua bán / nhà mới / thuê), dữ liệu đồng bộ hằng ngày.
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import {
  fetchLvrTransactions, fetchLvrStats, fetchLvrTrend, fetchLvrLastUpdate, type LvrFilters, type LvrKind,
} from "@/lib/lvrData"
import { LVR_CITIES } from "@/lib/lvrI18n"
import LvrClient from "./LvrClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tra cứu giá nhà thực tế 實價登錄 — giá mua bán & giá thuê | 8386.tw",
  description:
    "Giá giao dịch thực tế (實價登錄) mua bán nhà, nhà mới dự án và giá thuê nhà tại Đài Trung, Đài Bắc, Đào Viên, Cao Hùng... Cập nhật mỗi ngày từ dữ liệu Bộ Nội chính, giải thích bằng tiếng Việt.",
  alternates: { canonical: "https://8386.tw/gia-thi-truong" },
}

type SP = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined

export default async function LvrPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const cityParam = one(sp.city)
  const kindParam = one(sp.kind)
  const months = Number(one(sp.months))
  const page = Number(one(sp.page))
  const filters: LvrFilters = {
    city: LVR_CITIES.some(c => c.zh === cityParam) ? cityParam! : "台中市",
    kind: (["sale", "presale", "rent"].includes(kindParam || "") ? kindParam : "sale") as LvrKind,
    district: one(sp.district),
    buildingType: one(sp.type),
    rooms: one(sp.rooms),
    months: [3, 6, 12].includes(months) ? months : 12,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }

  const [tx, stats, trend, lastUpdate] = await Promise.all([
    fetchLvrTransactions(supabase, filters),
    fetchLvrStats(supabase, filters),
    fetchLvrTrend(supabase, filters),
    fetchLvrLastUpdate(supabase),
  ])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Giá giao dịch bất động sản thực tế tại Đài Loan (實價登錄)",
    description: "Giá mua bán, nhà mới (預售屋) và giá thuê nhà thực tế tại Đài Loan, cập nhật hằng ngày.",
    url: "https://8386.tw/gia-thi-truong",
    inLanguage: ["vi", "zh-TW"],
    isBasedOn: "https://plvr.land.moi.gov.tw/DownloadOpenData",
    ...(lastUpdate ? { dateModified: lastUpdate } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LvrClient
        initialFilters={filters}
        initialRows={tx.rows}
        initialTotal={tx.total}
        initialStats={stats}
        initialTrend={trend}
        lastUpdate={lastUpdate}
      />
    </>
  )
}
