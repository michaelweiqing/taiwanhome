// app/khu-vuc-nguoi-viet/page.tsx
// "Bản đồ người Việt tại Đài Loan" — trang danh sách khu vực cộng đồng.

import type { Metadata } from "next"
import Link from "next/link"
import { getVnCommunities } from "@/lib/vnCommunities"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Bản đồ người Việt tại Đài Loan | 台灣越南人生活地圖",
  description:
    "Khu vực người Việt thường sinh sống, học tập và làm việc tại Đài Loan — chợ Việt, quán ăn Việt, nhà thờ, bệnh viện, khu công nghiệp gần bạn.",
  alternates: { canonical: "https://8386.tw/khu-vuc-nguoi-viet" },
}

export default async function VnCommunitiesPage() {
  const communities = await getVnCommunities()

  // Nhóm theo thành phố để dễ mở rộng sau này (hiện chỉ có Đài Trung)
  const byCity = communities.reduce<Record<string, typeof communities>>((acc, c) => {
    acc[c.city_vi] = acc[c.city_vi] || []
    acc[c.city_vi].push(c)
    return acc
  }, {})

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bản đồ người Việt tại Đài Loan",
    url: "https://8386.tw/khu-vuc-nguoi-viet",
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-600">Bản đồ người Việt</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          🗺️ Bản đồ người Việt tại Đài Loan
        </h1>
        <p className="text-sm text-gray-400">台灣越南人生活地圖</p>
        <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
          Những khu vực người Việt thường sinh sống, học tập và làm việc — chợ Việt,
          quán ăn Việt, nhà thờ, bệnh viện, trường học, khu công nghiệp và trạm xe gần bạn nhất.
          Bắt đầu với khu vực Đài Trung, các khu vực khác sẽ sớm được cập nhật.
        </p>
      </header>

      {Object.entries(byCity).map(([cityVi, list]) => (
        <section key={cityVi} className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">📍 {cityVi}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((c) => (
              <Link key={c.slug} href={`/khu-vuc-nguoi-viet/${c.slug}`}
                className="bg-white border border-gray-100 hover:border-red-300 rounded-2xl p-4 shadow-sm transition group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition">
                    {c.name_vi}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mb-2">{c.name_zh} · {c.district}</p>
                {c.description_vi && (
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {c.description_vi}
                  </p>
                )}
                <span className="inline-block mt-3 text-xs font-semibold text-red-600">
                  Xem chi tiết →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
