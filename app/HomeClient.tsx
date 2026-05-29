"use client"
import Link from "next/link"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import PropertyCard from "@/components/PropertyCard"

interface Props { featured: Property[]; newest: Property[] }

export default function HomeClient({ featured, newest }: Props) {
  const { lang, t } = useLang()
  return (
    <div>
      <div className="bg-red-600 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-white text-3xl font-bold mb-2">
            {lang==="zh"?"找到您的理想家園":"Tìm ngôi nhà lý tưởng của bạn"}
          </h1>
          <p className="text-red-100 mb-7 text-sm">
            {lang==="zh"?"台灣最大中越雙語房產平台":"Nền tảng BĐS Đài Loan song ngữ Trung-Việt"}
          </p>
          <div className="flex bg-white rounded-2xl overflow-hidden shadow-xl max-w-lg mx-auto">
            <select className="border-r border-gray-100 px-3 py-3.5 text-sm bg-white focus:outline-none">
              <option>{t.rent}</option><option>{t.buy}</option>
            </select>
            <input type="text"
              placeholder={lang==="zh"?"搜尋地區、捷運站...":"Tìm khu vực, ga MRT..."}
              className="flex-1 px-4 py-3.5 text-sm focus:outline-none" />
            <Link href="/listings" className="bg-red-600 hover:bg-red-700 text-white px-5 py-3.5 text-sm font-semibold transition">
              {lang==="zh"?"搜尋":"Tìm"}
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-500 rounded-full" />{t.featured}
              </h2>
              <Link href="/listings" className="text-sm text-red-600 hover:underline">
                {lang==="zh"?"查看全部 →":"Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(p=><PropertyCard key={p.id} property={p}/>)}
            </div>
          </section>
        )}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full"/>
            {lang==="zh"?"熱門城市":"Thành phố phổ biến"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[{city:"台北市",vi:"Đài Bắc",emoji:"🏙️",n:5234},{city:"台中市",vi:"Đài Trung",emoji:"🌆",n:3891},{city:"高雄市",vi:"Cao Hùng",emoji:"🌊",n:2710},{city:"台南市",vi:"Đài Nam",emoji:"🏯",n:1482}].map(c=>(
              <Link key={c.city} href={`/listings?city=${c.city}`}
                className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:border-red-400 hover:shadow-sm transition">
                <div className="text-3xl mb-1.5">{c.emoji}</div>
                <div className="font-bold text-gray-900 text-sm">{lang==="zh"?c.city:c.vi}</div>
                <div className="text-xs text-red-500 mt-0.5">{c.n.toLocaleString()} {lang==="zh"?"件":"căn"}</div>
              </Link>
            ))}
          </div>
        </section>
        {newest.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-500 rounded-full"/>{t.new}
              </h2>
              <Link href="/listings" className="text-sm text-red-600 hover:underline">
                {lang==="zh"?"查看全部 →":"Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newest.map(p=><PropertyCard key={p.id} property={p}/>)}
            </div>
          </section>
        )}
        <section className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <h2 className="font-bold text-gray-900 text-xl mb-2">
            {lang==="zh"?"想刊登物件？":"Bạn muốn đăng bán nhà?"}
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            {lang==="zh"?"免費刊登，快速媒合買家":"Đăng tin miễn phí, kết nối người mua nhanh"}
          </p>
          <a href="https://line.me" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition">
            💬 {lang==="zh"?"LINE 聯絡我們":"Liên hệ LINE"}
          </a>
        </section>
      </div>
    </div>
  )
}
