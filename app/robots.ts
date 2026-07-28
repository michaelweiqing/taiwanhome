import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profile", "/submit/edit", "/login"],
    },
    sitemap: "https://8386.tw/sitemap.xml",
  }
}
