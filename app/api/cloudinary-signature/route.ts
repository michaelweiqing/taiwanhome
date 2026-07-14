import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Ký (sign) yêu cầu upload video lên Cloudinary — video sẽ tự động được
// nén/resize xuống tối đa 1080p (giữ tỉ lệ dọc 9:16 cho reels) ngay khi upload.
export async function POST(req: NextRequest) {
  try {
    const { subFolder } = await req.json() // "rent" | "sell"
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json({ error: "Cloudinary chưa được cấu hình (thiếu biến môi trường)" }, { status: 500 })
    }

    const folder = `reels/${subFolder === "rent" ? "rent" : "sell"}`
    const timestamp = Math.round(Date.now() / 1000)
    // Giới hạn kích thước dài nhất 1080px (portrait 1080x1920), tự chọn chất lượng & codec tối ưu
    const eager = "c_limit,w_1080,h_1920,q_auto,vc_h264"
    const eagerAsync = "false"

    // Chuỗi cần ký: các tham số (trừ file, cloud_name, resource_type, api_key) sắp xếp theo alphabet
    const paramsToSign = `eager=${eager}&eager_async=${eagerAsync}&folder=${folder}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex")

    return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder, eager, eagerAsync })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
