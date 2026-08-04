// app/[slug]/page.tsx — SEO landing page tĩnh theo từ khóa
// (VD: /thue-nha-dai-trung, /mua-nha-dai-loan...)

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { searchProperties } from "@/lib/data"
import { SEO_LANDING_PAGES, getSeoLandingPage } from "@/lib/seoLandingPages"
import PropertyCard from "@/components/PropertyCard"

export const revalidate = 3600 // ISR: cập nhật lại mỗi giờ

export async function generateStaticParams() {
  return SEO_LANDING_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = getSeoLandingPage(slug)
  if (!config) return {}

  const url = `https://8386.tw/${slug}`

  return {
    title: `${config.title_vi} | ${config.title_zh}`,
    description: config.metaDescription_vi,
    alternates: { canonical: url },
    openGraph: {
      title: config.title_vi,
      description: config.metaDescription_vi,
      url,
      siteName: "8386找房網",
      images: ["/og-image.png"],
      locale: "zh_TW",
      type: "website",
    },
  }
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = getSeoLandingPage(slug)
  if (!config) notFound()

  const properties = await searchProperties({
    listingType: config.type,
    city: config.city,
    sortBy: "newest",
  })
  const shown = properties.slice(0, 24)

  const listingsHref = `/listings?type=${config.type}${
    config.city ? `&city=${encodeURIComponent(config.city)}` : ""
  }`

  // Trang cùng thành phố nhưng khác loại giao dịch (mua ↔ thuê)
  const crossTypePage = SEO_LANDING_PAGES.find(
    (p) => p.city === config.city && p.type !== config.type
  )

  // Các thành phố khác cùng loại giao dịch (chỉ lấy trang có city, bỏ trang toàn quốc)
  const otherCities = SEO_LANDING_PAGES.filter(
    (p) => p.type === config.type && p.city && p.city !== config.city
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.h1_vi,
    description: config.metaDescription_vi,
    url: `https://8386.tw/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: shown.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://8386.tw/listings/${p.id}`,
      })),
    },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-600">{config.h1_vi}</span>
      </nav>

      {/* H1 + intro song ngữ */}
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">{config.h1_vi}</h1>
        <p className="text-sm text-gray-400">{config.h1_zh}</p>
        <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
          {config.intro_vi}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed max-w-3xl">
          {config.intro_zh}
        </p>
        {config.type === "buy" && (
          <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs leading-relaxed max-w-3xl">
            ⚠️ Lưu ý: Theo nguyên tắc bình đẳng tương hỗ (Điều 18 Luật Đất đai Đài Loan), Việt Nam hiện chưa nằm trong danh sách quốc gia được phép đứng tên mua bất động sản tại Đài Loan. Người Việt đã nhập tịch Đài Loan (phổ biến qua diện kết hôn) có thể mua nhà bình thường như công dân Đài. Trường hợp khác nên tham khảo luật sư/chuyên viên địa chính trước khi tiến hành —{" "}
            <Link href="/blog/thu-tuc-mua-nha-dai-loan-nguoi-nuoc-ngoai" className="underline font-medium">
              xem chi tiết tại đây
            </Link>.
          </p>
        )}
      </header>

      {/* Cross-link mua/thuê + link xem toàn bộ với filter đầy đủ */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={listingsHref}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          Xem tất cả + bộ lọc chi tiết →
        </Link>
        {crossTypePage && (
          <Link
            href={`/${crossTypePage.slug}`}
            className="bg-white border border-gray-200 hover:border-red-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            {crossTypePage.type === "rent" ? "Xem tin cho thuê" : "Xem tin mua bán"} tại {config.cityViLabel}
          </Link>
        )}
      </div>

      {/* Grid listing */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shown.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm py-8 text-center">
          Hiện chưa có tin đăng phù hợp — vui lòng quay lại sau hoặc{" "}
          <Link href={listingsHref} className="text-red-600 hover:underline">
            xem toàn bộ khu vực khác
          </Link>
          .
        </p>
      )}

      {/* Internal link các thành phố khác cùng loại giao dịch */}
      {otherCities.length > 0 && (
        <section className="pt-4 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            {config.type === "rent" ? "Thuê nhà" : "Mua nhà"} tại các thành phố khác
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs px-3 py-1.5 rounded-full transition"
              >
                {c.cityViLabel}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
