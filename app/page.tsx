export const revalidate = 60

import { getFeaturedProperties, getAllProperties, getApprovedReels } from "@/lib/data"
import { getVnCommunities } from "@/lib/vnCommunities"
import HomeClient from "./HomeClient"

export default async function HomePage() {
  const [featured, newest, reels, vnCommunities] = await Promise.all([
    getFeaturedProperties(),
    getAllProperties(),
    getApprovedReels(),
    getVnCommunities(),
  ])

  console.log("FEATURED COUNT:", featured.length)
  console.log("NEWEST COUNT:", newest.length)
  console.log("FEATURED DATA:", JSON.stringify(featured[0]?.title_vi))

  return <HomeClient featured={featured} newest={newest.slice(0, 4)} reels={reels} vnCommunities={vnCommunities} />
}