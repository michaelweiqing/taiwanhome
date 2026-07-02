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
}

export async function getAllProperties(): Promise<Property[]> {
  const [r1, r2] = await Promise.all([
    supabase.from("properties").select("*").order("posted_at", { ascending: false }),
    supabase.from("user_listings").select("*").order("posted_at", { ascending: false }),
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

export async function getPropertyById(id: string): Promise<Property | null> {
  // Tìm trong properties trước, sau đó user_listings
  const { data: p1 } = await supabase.from("properties").select("*").eq("id", id).maybeSingle()
  if (p1) return { ...p1, source: "admin" } as Property
  const { data: p2 } = await supabase.from("user_listings").select("*").eq("id", id).maybeSingle()
  if (p2) return { ...p2, source: "user" } as Property
  return null
}

export async function getSimilarProperties(
  currentId: string,
  listingType: "rent" | "buy",
  limit = 3,
  opts?: { propertyType?: string; district?: string; city?: string; price?: number }
): Promise<Property[]> {
  const results: Property[] = []

  // Chạy cùng 1 điều kiện lọc trên cả 2 bảng (admin + khách đăng), gộp kết quả
  async function queryBoth(
    build: (q: any) => any,
    take: number
  ): Promise<Property[]> {
    const [r1, r2] = await Promise.all([
      build(supabase.from("properties").select("*")).order("posted_at", { ascending: false }).limit(take),
      build(supabase.from("user_listings").select("*")).order("posted_at", { ascending: false }).limit(take),
    ])
    const admin = (r1.data || []).map((p: any) => ({ ...p, source: "admin" as const }))
    const user  = (r2.data || []).map((p: any) => ({ ...p, source: "user"  as const }))
    return [...admin, ...user] as Property[]
  }

  // Bước 1: cùng loại nhà + cùng quận
  if (opts?.propertyType && opts?.district) {
    const data = await queryBoth(q => q
      .eq("listing_type", listingType)
      .eq("property_type", opts.propertyType)
      .eq("district", opts.district)
      .neq("id", currentId), limit)
    results.push(...data)
  }

  // Bước 2: cùng loại nhà + cùng thành phố (bù nếu thiếu)
  if (results.length < limit && opts?.propertyType && opts?.city) {
    const existing = [...results.map(r => r.id), currentId]
    const data = await queryBoth(q => q
      .eq("listing_type", listingType)
      .eq("property_type", opts.propertyType)
      .eq("city", opts.city)
      .not("id", "in", `(${existing.join(",")})`), limit - results.length)
    results.push(...data)
  }

  // Bước 3: cùng listing_type + giá ±30% (fallback)
  if (results.length < limit && opts?.price) {
    const existing = [...results.map(r => r.id), currentId]
    const lo = Math.round(opts.price * 0.7)
    const hi = Math.round(opts.price * 1.3)
    const data = await queryBoth(q => q
      .eq("listing_type", listingType)
      .gte("price", lo)
      .lte("price", hi)
      .not("id", "in", `(${existing.join(",")})`), limit - results.length)
    results.push(...data)
  }

  return results.slice(0, limit)
}

export interface FilterOptions {
  listingType?: "rent" | "buy"
  city?: string
  district?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  bedrooms?: number
  sortBy?: "newest" | "price_asc" | "price_desc"
}

export async function searchProperties(filters: FilterOptions): Promise<Property[]> {
  function buildQuery(table: string) {
    let query = supabase.from(table).select("*")
    if (filters.listingType)  query = query.eq("listing_type",  filters.listingType)
    if (filters.city)         query = query.eq("city",          filters.city)
    if (filters.district)     query = query.eq("district",      filters.district)
    if (filters.propertyType) query = query.eq("property_type", filters.propertyType)
    if (filters.minPrice)     query = query.gte("price",        filters.minPrice)
    if (filters.maxPrice)     query = query.lte("price",        filters.maxPrice)
    if (filters.minArea)      query = query.gte("area_ping",    filters.minArea)
    if (filters.bedrooms)     query = query.eq("bedrooms",      filters.bedrooms)
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
