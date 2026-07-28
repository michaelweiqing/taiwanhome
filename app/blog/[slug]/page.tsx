// app/blog/[slug]/page.tsx — Chi tiết bài viết blog

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { BLOG_POSTS, getBlogPost } from "@/lib/blogPosts"

export const revalidate = 3600

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  const url = `https://8386.tw/blog/${slug}`
  return {
    title: `${post.title_vi} | 8386找房網`,
    description: post.description_vi,
    alternates: { canonical: url },
    openGraph: {
      title: post.title_vi,
      description: post.description_vi,
      url,
      type: "article",
      publishedTime: post.publishedAt,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title_vi,
    description: post.description_vi,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "8386找房網" },
    publisher: { "@type": "Organization", name: "8386找房網" },
    mainEntityOfPage: `https://8386.tw/blog/${slug}`,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-4">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-red-600">Blog</Link>
        <span>/</span>
        <span className="text-gray-600 line-clamp-1">{post.title_vi}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{post.title_vi}</h1>
        <p className="text-gray-400 text-sm mt-1">{post.title_zh}</p>
        <p className="text-gray-400 text-xs mt-2">
          {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </header>

      <article className="prose prose-sm max-w-none space-y-6">
        {post.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {section.heading_vi}
            </h2>
            {section.paragraphs_vi.map((para, j) => (
              <p key={j} className="text-gray-700 text-sm leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </section>
        ))}
      </article>

      {/* CTA liên hệ agent */}
      <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
        <p className="text-gray-700 text-sm mb-3">
          Cần tư vấn trực tiếp về thuê/mua nhà tại Đài Loan?
        </p>
        <a
          href="https://page.line.me/881vvzrj"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
        >
          💬 Liên hệ qua LINE
        </a>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href="/blog" className="text-red-600 text-sm hover:underline">
          ← Xem thêm bài viết khác
        </Link>
      </div>
    </div>
  )
}
