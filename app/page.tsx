// app/page.tsx — Trang chủ, Server Component fetch Supabase
export const revalidate = 0

import Link from "next/link"
import { getFeaturedProperties, getAllProperties } from "@/lib/data"
import HomeClient from "./HomeClient"

export default async function HomePage() {
  const [featured, newest] = await Promise.all([
    getFeaturedProperties(),
    getAllProperties(),
  ])

  return <HomeClient featured={featured} newest={newest.slice(0, 4)} />
}
