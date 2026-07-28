// app/blog/page.tsx — Danh sách bài viết blog

import type { Metadata } from "next"
import Link from "next/link"
import { getBlogPostsSorted } from "@/lib/blogPosts"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog - Kinh nghiệm thuê nhà, mua nhà tại Đài Loan | 8386找房網",
  description:
    "Chia sẻ kinh nghiệm thuê nhà, mua nhà, thủ tục pháp lý bất động sản tại Đài Loan dành cho người Việt.",
  alternates: { canonical: "https://8386.tw/blog" },
}

export default function BlogListPage() {
  const posts = getBlogPostsSorted()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Kinh nghiệm thuê nhà, mua nhà tại Đài Loan
        </h1>
        <p className="text-gray-400 text-sm mt-1">台灣租屋購屋經驗分享</p>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-red-200 hover:shadow-md transition"
          >
            <h2 className="font-bold text-gray-900 text-lg">{post.title_vi}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{post.title_zh}</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {post.description_vi}
            </p>
            <p className="text-red-500 text-xs mt-3 font-medium">
              Đọc tiếp →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
