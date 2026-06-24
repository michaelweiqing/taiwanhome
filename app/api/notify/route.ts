import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    const token  = process.env.LINE_CHANNEL_TOKEN
    const userId = process.env.LINE_ADMIN_USER_ID

    if (!token || !userId) {
      console.error("LINE env missing:", { hasToken: !!token, hasUserId: !!userId })
      return NextResponse.json({ ok: false, error: "missing env vars" })
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: message }],
      }),
    })

    const data = await res.json()
    if (!res.ok) console.error("LINE API error:", data)
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (err: any) {
    console.error("LINE notify error:", err.message)
    return NextResponse.json({ ok: false, error: err.message })
  }
}
