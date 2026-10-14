// app/api/admin/refresh-pois/route.ts
// Admin bấm nút ở /admin/quan-ly-tin: lấy tiện ích xung quanh (永慶) cho các tin chưa có. Mỗi lần tối đa 25 tin.
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { backfillPois } from "@/lib/poiSync"

export const maxDuration = 120
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: "bad_request" }, { status: 400 })
    const r = await backfillPois(String(password), 25)
    for (const id of r.ids) revalidatePath(`/listings/${id}`)
    return NextResponse.json({ ok: true, done: r.ids.length, failed: r.failed, remaining: r.remaining })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 })
  }
}
