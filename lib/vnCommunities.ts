// lib/vnCommunities.ts
// "Bản đồ người Việt tại Đài Loan" — dữ liệu khu vực cộng đồng người Việt.

import { supabase } from "@/lib/supabase"
import { searchProperties } from "@/lib/data"

export interface VnCommunity {
  id: string
  slug: string
  city: string
  city_vi: string
  district: string
  name_zh: string
  name_vi: string
  description_zh: string | null
  description_vi: string | null
  population_note_zh: string | null
  population_note_vi: string | null
  lat: number | null
  lng: number | null
  cover_image_url: string | null
  display_order: number
  is_active: boolean
}

export type VnPlaceCategory =
  | "market" | "restaurant" | "shop" | "church"
  | "hospital" | "university" | "industrial_zone" | "bus_stop"

export interface VnCommunityPlace {
  id: string
  community_id: string
  category: VnPlaceCategory
  name_zh: string
  name_vi: string | null
  address: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  notes_zh: string | null
  notes_vi: string | null
  display_order: number
}

export const CATEGORY_META: Record<VnPlaceCategory, { icon: string; zh: string; vi: string }> = {
  market:          { icon: "🛒", zh: "市場/超市",   vi: "Chợ / Siêu thị" },
  restaurant:      { icon: "🍜", zh: "越南料理",     vi: "Quán ăn Việt" },
  shop:            { icon: "🏪", zh: "越南商店",     vi: "Cửa hàng Việt" },
  church:          { icon: "⛪", zh: "教堂",         vi: "Nhà thờ" },
  hospital:        { icon: "🏥", zh: "醫院",         vi: "Bệnh viện" },
  university:      { icon: "🎓", zh: "大學",         vi: "Trường đại học" },
  industrial_zone: { icon: "🏭", zh: "工業區",       vi: "Khu công nghiệp" },
  bus_stop:        { icon: "🚌", zh: "車站/公車站",  vi: "Trạm xe / Ga tàu" },
}

export async function getVnCommunities(): Promise<VnCommunity[]> {
  const { data, error } = await supabase
    .from("vn_communities")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
  if (error) { console.error("getVnCommunities:", error.message); return [] }
  return data as VnCommunity[]
}

export async function getVnCommunityBySlug(slug: string): Promise<VnCommunity | null> {
  const { data, error } = await supabase
    .from("vn_communities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
  if (error) { console.error("getVnCommunityBySlug:", error.message); return null }
  return data as VnCommunity | null
}

export async function getVnCommunityPlaces(communityId: string): Promise<VnCommunityPlace[]> {
  const { data, error } = await supabase
    .from("vn_community_places")
    .select("*")
    .eq("community_id", communityId)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true })
  if (error) { console.error("getVnCommunityPlaces:", error.message); return [] }
  return data as VnCommunityPlace[]
}

// Đếm số tin đang cho thuê/bán + giá trung bình theo quận (khớp với properties.district)
export async function getVnCommunityListingStats(district: string) {
  const [rentList, buyList] = await Promise.all([
    searchProperties({ district, listingType: "rent" }),
    searchProperties({ district, listingType: "buy" }),
  ])
  const avg = (arr: { price: number }[]) =>
    arr.length ? Math.round(arr.reduce((s, p) => s + Number(p.price), 0) / arr.length) : null

  return {
    rentCount: rentList.length,
    buyCount: buyList.length,
    rentAvgPrice: avg(rentList),
    buyAvgPrice: avg(buyList),
    rentSample: rentList.slice(0, 8),
    buySample: buyList.slice(0, 8),
  }
}
