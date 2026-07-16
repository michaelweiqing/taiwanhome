import { NextRequest, NextResponse } from "next/server"
import { uploadVideoToBunny } from "@/lib/bunny"

export const runtime = "nodejs"
export const maxDuration = 60 // Vercel: video upload có thể mất thời gian

const MAX_BYTES = 800 * 1024 * 1024 // 800MB, đồng bộ với giới hạn cũ ở ReelUploadModal

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string) || `video-${Date.now()}`

    if (!file) {
      return NextResponse.json({ error: "Thiếu file video" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File vượt quá 800MB" }, { status: 400 })
    }

    const result = await uploadVideoToBunny(file, title)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error("Bunny upload error:", e)
    return NextResponse.json(
      { error: e?.message || "Tải video lên thất bại" },
      { status: 500 }
    )
  }
}
