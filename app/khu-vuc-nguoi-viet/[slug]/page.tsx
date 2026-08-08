// app/khu-vuc-nguoi-viet/[slug]/page.tsx
// Trang chi tiết 1 khu vực trong "Bản đồ người Việt tại Đài Loan".

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import {
  getVnCommunities, getVnCommunityBySlug, getVnCommunityPlaces,
  getVnCommunityListingStats, CATEGORY_META, type VnPlaceCategory,
} from "@/lib/vnCommunities"
import PropertyCard from "@/components/PropertyCard"

export const revalidate = 300

export async function generateStaticParams() {
  const list = await getVnCommunities()
  return list.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const c = await getVnCommunityBySlug(slug)
  if (!c) return {}
  const url = `https://8386.tw/khu-vuc-nguoi-viet/${slug}`
  return {
    title: `${c.name_vi} (${c.name_zh}) — Khu vực người Việt | 8386.tw`,
    description: c.description_vi || c.description_zh || undefined,
    alternates: { canonical: url },
    openGraph: { title: c.name_vi, description: c.description_vi || "", url, siteName: "8386找房網" },
  }
}

export default async function VnCommunityDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const community = await getVnCommunityBySlug(slug)
  if (!community) notFound()

  const [places, stats] = await Promise.all([
    getVnCommunityPlaces(community.id),
    getVnCommunityListingStats(community.district),
  ])

  const placesByCategory = places.reduce<Record<string, typeof places>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})
  const CATEGORY_ORDER: VnPlaceCategory[] = [
    "market", "restaurant", "shop", "church", "hospital", "university", "industrial_zone", "bus_stop",
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: community.name_vi,
    address: { "@type": "PostalAddress", addressLocality: community.district, addressRegion: community.city },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>/</span>
        <Link href="/khu-vuc-nguoi-viet" className="hover:text-red-600">Bản đồ cuộc sống người Việt</Link>
        <span>/</span>
        <span className="text-gray-600">{community.name_vi}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">📍 {community.name_vi}</h1>
        <p className="text-sm text-gray-400">{community.name_zh} · {community.city} {community.district}</p>
        {community.description_vi && (
          <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">{community.description_vi}</p>
        )}
        {community.description_zh && (
          <p className="text-gray-400 text-xs leading-relaxed max-w-3xl">{community.description_zh}</p>
        )}
        {community.population_note_vi && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs leading-relaxed max-w-3xl">
            👨‍👩‍👧‍👦 {community.population_note_vi}
          </p>
        )}
      </header>

      {/* 🏠 Thống kê tin đăng theo khu vực */}
      <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">🏠 Nhà đất tại {community.name_vi}</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rentCount}</p>
            <p className="text-xs text-gray-500">tin đang cho thuê</p>
            {stats.rentAvgPrice != null && (
              <p className="text-xs text-gray-400 mt-1">
                💰 TB {stats.rentAvgPrice.toLocaleString()} Đài tệ/tháng
              </p>
            )}
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.buyCount}</p>
            <p className="text-xs text-gray-500">tin đang bán</p>
            {stats.buyAvgPrice != null && (
              <p className="text-xs text-gray-400 mt-1">
                💰 TB {stats.buyAvgPrice.toLocaleString()} vạn Đài tệ
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/listings?type=rent&district=${encodeURIComponent(community.district)}`}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            Xem tin cho thuê →
          </Link>
          <Link href={`/listings?type=buy&district=${encodeURIComponent(community.district)}`}
            className="bg-white border border-gray-200 hover:border-red-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition">
            Xem tin mua bán →
          </Link>
        </div>
      </section>

      {/* Tiện ích xung quanh theo từng nhóm */}
      {CATEGORY_ORDER.filter((cat) => placesByCategory[cat]?.length).map((cat) => {
        const meta = CATEGORY_META[cat]
        const list = placesByCategory[cat]
        return (
          <section key={cat} className="space-y-3">
            <h2 className="font-bold text-gray-900">{meta.icon} {meta.vi}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {list.map((p) => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-3.5">
                  <p className="font-semibold text-gray-900 text-sm">
                    {p.name_vi || p.name_zh}
                  </p>
                  {p.name_vi && (
                    <p className="text-xs text-gray-400">{p.name_zh}</p>
                  )}
                  {p.address && (
                    <p className="text-xs text-gray-500 mt-1">📍 {p.address}</p>
                  )}
                  {p.phone && (
                    <p className="text-xs text-gray-500">☎️ {p.phone}</p>
                  )}
                  {(p.notes_vi || p.notes_zh) && (
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {p.notes_vi || p.notes_zh}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* Tin đăng nổi bật tại khu vực */}
      {stats.rentSample.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-gray-900">🏠 Tin cho thuê mới nhất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.rentSample.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}
      {stats.buySample.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-gray-900">🏠 Tin mua bán mới nhất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.buySample.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
