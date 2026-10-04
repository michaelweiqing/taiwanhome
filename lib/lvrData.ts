// lib/lvrData.ts — truy vấn dữ liệu 實價登錄 (dùng được cả server lẫn client)
import type { SupabaseClient } from "@supabase/supabase-js"

export type LvrKind = "sale" | "presale" | "rent"

export interface LvrTx {
  id: string; district: string; address: string | null; deal_date: string
  building_type: string | null; main_use: string | null; floor: string | null; total_floors: number | null
  built_year: number | null; area_m2: number | null; rooms: number | null; halls: number | null; baths: number | null
  total_price: number | null; parking_price: number | null; unit_ping: number | null; is_special: boolean
  note: string | null; project_name: string | null; rent_type: string | null
  has_elevator: boolean | null; furnished: boolean | null
}
export interface LvrDistrictStat { district: string | null; deals: number; median_unit: number | null; median_total: number | null; median_area_ping: number | null }
export interface LvrTrendPoint { month: string; deals: number; median_unit: number | null }

export interface LvrFilters {
  city: string; kind: LvrKind; district?: string; buildingType?: string; rooms?: string; months: number; page: number
}

export const LVR_PAGE_SIZE = 20
const TX_COLS = "id,district,address,deal_date,building_type,main_use,floor,total_floors,built_year,area_m2,rooms,halls,baths,total_price,parking_price,unit_ping,is_special,note,project_name,rent_type,has_elevator,furnished"

const sinceDate = (months: number) => {
  const d = new Date(); d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}

export async function fetchLvrTransactions(sb: SupabaseClient, f: LvrFilters) {
  let q = sb.from("lvr_transactions").select(TX_COLS, { count: "exact" })
    .eq("city", f.city).eq("kind", f.kind).gte("deal_date", sinceDate(f.months))
  if (f.district) q = q.eq("district", f.district)
  if (f.buildingType) q = q.eq("building_type", f.buildingType)
  if (f.rooms === "0") q = q.eq("rooms", 0)
  else if (f.rooms === "4") q = q.gte("rooms", 4)
  else if (f.rooms) q = q.eq("rooms", Number(f.rooms))
  const from = (f.page - 1) * LVR_PAGE_SIZE
  const { data, count, error } = await q.order("deal_date", { ascending: false }).order("id").range(from, from + LVR_PAGE_SIZE - 1)
  if (error) console.error("lvr tx error", error.message)
  return { rows: (data || []) as LvrTx[], total: count || 0 }
}

export async function fetchLvrStats(sb: SupabaseClient, f: LvrFilters) {
  const { data, error } = await sb.rpc("lvr_district_stats", {
    p_city: f.city, p_kind: f.kind, p_months: f.months, p_building_type: f.buildingType || null,
  })
  if (error) console.error("lvr stats error", error.message)
  return ((data || []) as LvrDistrictStat[]).map(s => ({
    ...s, deals: Number(s.deals),
    median_unit: s.median_unit === null ? null : Number(s.median_unit),
    median_total: s.median_total === null ? null : Number(s.median_total),
    median_area_ping: s.median_area_ping === null ? null : Number(s.median_area_ping),
  }))
}

export async function fetchLvrTrend(sb: SupabaseClient, f: LvrFilters) {
  const { data, error } = await sb.rpc("lvr_monthly_trend", {
    p_city: f.city, p_kind: f.kind, p_district: f.district || null, p_months: 12,
  })
  if (error) console.error("lvr trend error", error.message)
  return ((data || []) as LvrTrendPoint[]).map(p => ({ ...p, deals: Number(p.deals), median_unit: p.median_unit === null ? null : Number(p.median_unit) }))
}

export async function fetchLvrLastUpdate(sb: SupabaseClient) {
  const { data } = await sb.from("lvr_sync_log").select("imported_at").order("imported_at", { ascending: false }).limit(1)
  return (data?.[0]?.imported_at as string | undefined) || null
}
