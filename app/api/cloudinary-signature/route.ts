import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Ký (sign) yêu cầu upload video lên Cloudinary.
// Việc nén xuống 1080p diễn ra "on-the-fly" khi phát (qua URL transformation),
// KHÔNG nén đồng bộ lúc upload — tránh giữ kết nối mở quá lâu trên mạng di động
// (nguyên nhân gây lỗi "Lỗi kết nối" khi tải video 4K dung lượng lớn).
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

    // Chuỗi cần ký: các tham số (trừ file, cloud_name, resource_type, api_key) sắp xếp theo alphabet
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex")

    return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
