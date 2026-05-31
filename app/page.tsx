export const revalidate = 0

import { getFeaturedProperties, getAllProperties } from "@/lib/data"
import HomeClient from "./HomeClient"

export default async function HomePage() {
  const [featured, newest] = await Promise.all([
    getFeaturedProperties(),
    getAllProperties(),
  ])

  console.log("FEATURED COUNT:", featured.length)
  console.log("NEWEST COUNT:", newest.length)
  console.log("FEATURED DATA:", JSON.stringify(featured[0]?.title_vi))

  return <HomeClient featured={featured} newest={newest.slice(0, 4)} />
}