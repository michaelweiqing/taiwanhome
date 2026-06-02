import { supabase } from "@/lib/supabase"

export interface NearbyPlaces {
  convenience?: string   // 近便利商店
  supermarket?: string   // 近超市
  market?: string        // 近傳統市場
  mall?: string          // 近百貨公司
  park?: string          // 近公園綠地
  school?: string        // 近學校
  hospital?: string      // 近醫療機構
  nightmarket?: string   // 近夜市
}

export interface Property {
  id: string
  title_zh: string
  title_vi: string
  district: string
  district_vi: string
  address: string
  address_vi: string
  city: string
  city_vi: string
  listing_type: "rent" | "buy"
  property_type: "apartment" | "house" | "studio" | "villa"
  price: number
  price_per_ping: number | null
  area_ping: number
  area_main_ping: number | null      // 主建物
  area_balcony_ping: number | null   // 附屬建物
  area_common_ping: number | null    // 共同使用
  area_land_ping: number | null      // 土地坪數
  bedrooms: number
  bathrooms: number
  floor: string
  total_floors: number
  age: number
  facing: string
  features: string[]
  features_vi: string[]
  near_mrt: string
  near_mrt_vi: string
  walk_minutes: number
  nearby: NearbyPlaces | null   // ← mới
  images: string[]
  agent_name: string
  agent_phone: string
  agent_line: string
  agent_name_vi: string
  agent_avatar: string | null
  agent_is_professional: boolean  // true = môi giới có công ty, false = chủ nhà tự đăng
  is_new: boolean
  is_featured: boolean
  parking: boolean
  management_fee: number | null
  views: number
  posted_at: string
  lat: number
  lng: number
  description_zh: string
  description_vi: string
}

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("posted_at", { ascending: false })
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .limit(4)
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()
  if (error) { console.error("Supabase:", error.message); return null }
  supabase.from("properties").update({ views: (data.views || 0) + 1 }).eq("id", id)
  return data as Property
}

export async function getSimilarProperties(
  currentId: string,
  listingType: "rent" | "buy",
  limit = 3
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("listing_type", listingType)
    .neq("id", currentId)
    .limit(limit)
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export interface FilterOptions {
  listingType?: "rent" | "buy"
  city?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  bedrooms?: number
  sortBy?: "newest" | "price_asc" | "price_desc"
}

export async function searchProperties(filters: FilterOptions): Promise<Property[]> {
  let query = supabase.from("properties").select("*")
  if (filters.listingType) query = query.eq("listing_type", filters.listingType)
  if (filters.city)        query = query.eq("city", filters.city)
  if (filters.minPrice)    query = query.gte("price", filters.minPrice)
  if (filters.maxPrice)    query = query.lte("price", filters.maxPrice)
  if (filters.minArea)     query = query.gte("area_ping", filters.minArea)
  if (filters.bedrooms)    query = query.eq("bedrooms", filters.bedrooms)
  if (filters.sortBy === "price_asc")  query = query.order("price", { ascending: true })
  else if (filters.sortBy === "price_desc") query = query.order("price", { ascending: false })
  else query = query.order("posted_at", { ascending: false })
  const { data, error } = await query
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export function formatPrice(p: Property, lang: "zh" | "vi"): string {
  if (p.listing_type === "rent") {
    return lang === "zh"
      ? `NT$${p.price.toLocaleString()}/月`
      : `NT$${p.price.toLocaleString()}/tháng`
  }
  return lang === "zh"
    ? `${p.price.toLocaleString()}萬`
    : `${p.price.toLocaleString()} vạn Đài tệ`
}

/** Hiển thị tầng — floor giờ là string nên dùng trực tiếp */
export function formatFloor(floor: string, totalFloors: number, lang: "zh" | "vi"): string {
  const floorStr = floor.trim()
  // Nếu là số thuần
  const num = Number(floorStr)
  if (!isNaN(num) && floorStr !== "") {
    return `${floorStr}/${totalFloors}F`
  }
  // Nếu là chữ (整棟, 全層, Toàn bộ, ...) — hiển thị thẳng
  return `${floorStr}/${totalFloors}F`
}

export function pingToM2(ping: number): number {
  return Math.round(ping * 3.306)
}