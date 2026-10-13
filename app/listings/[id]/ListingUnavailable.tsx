"use client"
// Hiển thị khi tin đã bán / đã gỡ — giữ link đã chia sẻ (Facebook/TikTok) vẫn hữu ích: gợi ý tin tương tự.
import Link from "next/link"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import PropertyCard from "@/components/PropertyCard"

export default function ListingUnavailable({ property, similar }: { property: Property; similar: Property[] }) {
  const { lang } = useLang()
  const sold = property.status === "sold"
  const title = lang === "zh" ? (property.title_zh || property.title_vi) : (property.title_vi || property.title_zh)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center">
        <div className="text-4xl mb-3">{sold ? "🏷️" : "📪"}</div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {sold
            ? (lang === "zh" ? "此物件已售出" : "Căn nhà này đã được bán")
            : (lang === "zh" ? "此物件已下架" : "Tin đăng này đã được gỡ")}
        </h1>
        {title && <p className="text-gray-500 mb-4 line-clamp-2">{title}</p>}
        <p className="text-sm text-gray-500 mb-6">
          {lang === "zh"
            ? "歡迎瀏覽其他類似物件，或聯絡我們協助您尋找合適的房子。"
            : "Bạn có thể xem các căn tương tự bên dưới hoặc liên hệ để chúng tôi tìm căn phù hợp cho bạn."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/listings" className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm">
            {lang === "zh" ? "瀏覽所有物件" : "Xem tất cả nhà"}
          </Link>
          <Link href="/" className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm">
            {lang === "zh" ? "回首頁" : "Về trang chủ"}
          </Link>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{lang === "zh" ? "類似物件" : "Nhà tương tự"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similar.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
