// app/api/admin/listing-status/route.ts
// Admin đổi trạng thái tin: active (đăng lại) / sold (đã bán) / removed (gỡ). Xác thực bằng mật khẩu admin trong hàm SQL.
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sbRpc } from "@/lib/listingImport"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { password, id, status, reason } = await req.json()
    if (!password || !id || !["active", "sold", "removed"].includes(status)) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 })
    }
    const ok = await sbRpc<boolean>("admin_set_listing_status", {
      p_password: password, p_id: String(id), p_status: status, p_reason: reason ?? null,
    })
    if (!ok) return NextResponse.json({ error: "not_found_or_unauthorized" }, { status: 403 })
    revalidatePath("/")
    revalidatePath("/listings")
    revalidatePath(`/listings/${id}`)
    revalidatePath("/sitemap.xml")
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "error" }, { status: 500 })
  }
}
