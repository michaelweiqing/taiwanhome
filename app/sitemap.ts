import { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"
import { SEO_LANDING_PAGES } from "@/lib/seoLandingPages"
import { BLOG_POSTS } from "@/lib/blogPosts"
import { getVnCommunities } from "@/lib/vnCommunities"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://8386.tw"

  const [{ data: adminProps }, { data: userProps }] = await Promise.all([
    supabase.from("properties").select("id, posted_at"),
    supabase.from("user_listings").select("id, posted_at").eq("is_active", true),
  ])

  const listingUrls: MetadataRoute.Sitemap = [
    ...(adminProps ?? []),
    ...(userProps ?? []),
  ].map((p) => ({
    url: `${baseUrl}/listings/${p.id}`,
    lastModified: p.posted_at ? new Date(p.posted_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }))

  const seoLandingUrls: MetadataRoute.Sitemap = SEO_LANDING_PAGES.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    changeFrequency: "daily",
    priority: p.city ? 0.85 : 0.95,
  }))

  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/listings`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/submit`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/khu-vuc-nguoi-viet`, changeFrequency: "weekly", priority: 0.75 },
  ]

  const vnCommunities = await getVnCommunities()
  const vnCommunityUrls: MetadataRoute.Sitemap = vnCommunities.map((c) => ({
    url: `${baseUrl}/khu-vuc-nguoi-viet/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticUrls, ...seoLandingUrls, ...blogUrls, ...vnCommunityUrls, ...listingUrls]
}
