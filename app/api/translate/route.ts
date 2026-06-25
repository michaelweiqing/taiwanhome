import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()
    if (!text?.trim()) return NextResponse.json({ result: "" })

    const langMap: Record<string, string> = {
      zh: "Traditional Chinese (繁體中文)",
      vi: "Vietnamese (Tiếng Việt)",
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Translate the following real estate listing text from ${langMap[from]} to ${langMap[to]}. Return ONLY the translated text, no explanation, no quotes, no preamble.\n\n${text}`
        }]
      })
    })

    const data = await res.json()
    const result = data?.content?.[0]?.text?.trim() || ""
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ result: "", error: err.message })
  }
}
