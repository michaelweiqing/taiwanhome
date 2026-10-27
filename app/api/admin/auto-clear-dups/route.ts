// POST { password } → tự bấm "Không trùng" cho các tin trùng đứng riêng lẻ (không nằm trong khung so sánh)
import { NextRequest, NextResponse } from "next/server"
import { autoClearStandaloneDuplicates } from "@/lib/listingQueueAuto"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: "missing_password" }, { status: 401 })
    const cleared = await autoClearStandaloneDuplicates(password)
    return NextResponse.json({ ok: true, cleared })
  } catch (err: any) {
    const status = /invalid_password/.test(err.message) ? 401 : 500
    return NextResponse.json({ error: err.message || "unknown_error" }, { status })
  }
}
