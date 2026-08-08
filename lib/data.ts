import { cache } from "react"
import { supabase } from "@/lib/supabase"

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
  property_type: "apartment" | "apartment_walkup" | "house" | "studio" | "villa"
  price: number
  price_per_ping: number | null
  area_ping: number
  area_main_ping: number | null       // 主建物
  area_balcony_ping: number | null    // 附屬建物
  area_common_ping: number | null     // 共同使用
  area_land_ping: number | null       // 土地坪數
  area_basement_ping: number | null   // 地下室
  bedrooms: number
  bathrooms: number
  floor: string                       // text (可填整棟、全層或數字)
  total_floors: number
  age: number
  facing: string
  features: string[]
  features_vi: string[]
  near_mrt?: string
  near_mrt_vi?: string
  walk_minutes?: number
  nearby?: Record<string, string> | null
  images: string[]
  video_url?: string | null
  video_thumbnail_url?: string | null
  agent_name: string
  agent_name_vi?: string
  agent_phone: string
  agent_line: string
  agent_avatar?: string | null
  agent_is_professional?: boolean
  agent_developer?: string | null     // 開發承辦人
  agent_company?: string | null       // 公司名稱
  is_new: boolean
  is_featured: boolean
  parking: boolean
  parking_type?: string | null        // 停車方式: flat | mechanical | flat_mechanical | other
  parking_type_other?: string | null  // Khi parking_type = "other"
  parking_number?: string | null      // 車位編號
  management_fee: number | null
  views: number
  posted_at: string
  lat: number
  lng: number
  description_zh: string | null
  description_vi: string | string[] | null
  community_name?: string | null      // 社區名稱
  total_units?: number | null         // 總戶數
  units_per_floor?: number | null     // 同層戶數
  elevator_count?: number | null      // 電梯數
  source?: "admin" | "user"           // Nguồn tin: admin đăng hay khách tự đăng
  is_active?: boolean                 // Chỉ áp dụng cho tin khách đăng — false = đã gỡ/tắt quảng cáo
}

export interface PropertyReel {
  id: string
  property_id: string
  property_source: "admin" | "user"
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  title_vi: string | null
  title_zh: string | null
  price: number | null
  listing_type: "rent" | "buy" | null
  city: string | null
  city_vi: string | null
  uploader_type: "admin" | "user"
  status: "pending" | "approved" | "rejected"
  views: number
  created_at: string
}

export async function getApprovedReels(): Promise<PropertyReel[]> {
  const { data, error } = await supabase
    .from("property_reels")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(30)
  if (error) { console.error("Supabase reels:", error.message); return [] }
  return data as PropertyReel[]
}

export async function getAllProperties(): Promise<Property[]> {
  const [r1, r2] = await Promise.all([
    supabase.from("properties").select("*").order("posted_at", { ascending: false }),
    supabase.from("user_listings").select("*").eq("is_active", true).order("posted_at", { ascending: false }),
  ])
  const admin = (r1.data || []).map(p => ({ ...p, source: "admin" as const }))
  const user  = (r2.data || []).map(p => ({ ...p, source: "user" as const }))
  return [...admin, ...user].sort((a, b) =>
    new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  )
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .order("posted_at", { ascending: false })
    .limit(4)
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export const getPropertyById = cache(async (id: string): Promise<Property | null> => {
  // Tìm song song trong cả 2 bảng thay vì tuần tự (giảm round-trip)
  // cache() giúp generateMetadata() và trang component dùng chung 1 lần gọi
  const [r1, r2] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase.from("user_listings").select("*").eq("id", id).eq("is_active", true).maybeSingle(),
  ])
  if (r1.data) return { ...r1.data, source: "admin" } as Property
  if (r2.data) return { ...r2.data, source: "user" } as Property
  return null
})

export const getSimilarProperties = cache(async (
  currentId: string,
  listingType: "rent" | "buy",
  limit = 3,
  opts?: { propertyType?: string; district?: string; city?: string; price?: number }
): Promise<Property[]> => {
  // Chỉ 1 round-trip song song (thay vì 3 round-trip tuần tự trước đây):
  // lấy toàn bộ tin cùng listing_type ở cả 2 bảng, rồi xếp hạng độ liên quan bằng JS.
  // Dữ liệu hiện tại nhỏ (~80 tin) nên cách này nhanh hơn nhiều so với nhiều round-trip DB.
  const [r1, r2] = await Promise.all([
    supabase.from("properties").select("*").eq("listing_type", listingType).neq("id", currentId),
    supabase.from("user_listings").select("*").eq("listing_type", listingType).eq("is_active", true).neq("id", currentId),
  ])
  const admin = (r1.data || []).map((p: any) => ({ ...p, source: "admin" as const }))
  const user  = (r2.data || []).map((p: any) => ({ ...p, source: "user"  as const }))
  const pool = [...admin, ...user] as Property[]

  function score(p: Property): number {
    let s = 0
    if (opts?.propertyType && p.property_type === opts.propertyType) s += 4
    if (opts?.district && p.district === opts.district) s += 3
    else if (opts?.city && p.city === opts.city) s += 1
    if (opts?.price) {
      const diff = Math.abs(Number(p.price) - opts.price) / opts.price
      if (diff <= 0.3) s += 2
      else if (diff <= 0.6) s += 1
    }
    return s
  }

  return pool
    .map(p => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || new Date(b.p.posted_at).getTime() - new Date(a.p.posted_at).getTime())
    .slice(0, limit)
    .map(x => x.p)
})

export interface FilterOptions {
  listingType?: "rent" | "buy"
  city?: string
  district?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number      // khớp đúng số phòng (1,2,3,4)
  bedroomsMin?: number   // từ N phòng trở lên (dùng cho "5房以上")
  minAge?: number
  maxAge?: number
  parking?: boolean
  sortBy?: "newest" | "price_asc" | "price_desc"
}

export async function searchProperties(filters: FilterOptions): Promise<Property[]> {
  function buildQuery(table: string) {
    let query = supabase.from(table).select("*")
    if (table === "user_listings") query = query.eq("is_active", true)
    if (filters.listingType)  query = query.eq("listing_type",  filters.listingType)
    if (filters.city)         query = query.eq("city",          filters.city)
    if (filters.district)     query = query.eq("district",      filters.district)
    if (filters.propertyType) query = query.eq("property_type", filters.propertyType)
    if (filters.minPrice)     query = query.gte("price",        filters.minPrice)
    if (filters.maxPrice)     query = query.lte("price",        filters.maxPrice)
    if (filters.minArea)      query = query.gte("area_ping",    filters.minArea)
    if (filters.maxArea)      query = query.lte("area_ping",    filters.maxArea)
    if (filters.bedrooms)     query = query.eq("bedrooms",      filters.bedrooms)
    if (filters.bedroomsMin)  query = query.gte("bedrooms",     filters.bedroomsMin)
    if (filters.minAge != null) query = query.gte("age",        filters.minAge)
    if (filters.maxAge != null) query = query.lte("age",        filters.maxAge)
    if (filters.parking != null) query = query.eq("parking",    filters.parking)
    if (filters.sortBy === "price_asc")
      query = query.order("price", { ascending: true })
    else if (filters.sortBy === "price_desc")
      query = query.order("price", { ascending: false })
    else
      query = query.order("posted_at", { ascending: false })
    return query
  }

  const [r1, r2] = await Promise.all([
    buildQuery("properties"),
    buildQuery("user_listings"),
  ])
  const admin = (r1.data || []) as Property[]
  const user  = (r2.data || []) as Property[]
  const merged = [...admin, ...user]

  // Sort merged results
  if (filters.sortBy === "price_asc")
    merged.sort((a, b) => Number(a.price) - Number(b.price))
  else if (filters.sortBy === "price_desc")
    merged.sort((a, b) => Number(b.price) - Number(a.price))
  else
    merged.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())

  return merged
}

export function formatPrice(p: Property, lang: "zh" | "vi"): string {
  const price = Number(p.price)
  if (p.listing_type === "rent") {
    return lang === "zh"
      ? `NT$${price.toLocaleString()}/月`
      : `NT$${price.toLocaleString()}/tháng`
  }
  return lang === "zh"
    ? `${price.toLocaleString()}萬`
    : `${price.toLocaleString()} vạn Đài tệ`
}

export function pingToM2(ping: number | string): number {
  return Math.round(Number(ping) * 3.306 * 10) / 10
}
