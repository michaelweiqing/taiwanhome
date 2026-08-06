// app/api/ai-search/route.ts
// 8386 AI - Trợ lý tìm nhà bằng tiếng Việt (Giai đoạn 1 - MVP)
// Luồng: câu tiếng Việt -> Claude trích xuất filter có cấu trúc (tool use)
//        -> server tự gọi searchProperties() trên Supabase (AI không tự bịa nhà)
//        -> nếu 0 kết quả thì nới lỏng điều kiện dần (theo mục 14 trong đề xuất)
import { NextRequest, NextResponse } from "next/server"
import { searchProperties, type FilterOptions, type Property } from "@/lib/data"
import { CITIES, DISTRICTS, PROPERTY_TYPES, locationsPromptBlock } from "@/lib/locations"

interface ParsedFilters {
  listingType?: "rent" | "buy"
  city?: string
  district?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bedroomsMin?: number
  minAge?: number
  maxAge?: number
  parking?: boolean
  requiredFeatures?: string[]
  keyword?: string
}

const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map(t => t.val)

const SYSTEM_PROMPT = `Bạn là bộ phân tích nhu cầu tìm nhà cho 8386.tw - nền tảng BĐS song ngữ Trung-Việt tại Đài Loan.
Nhiệm vụ DUY NHẤT: đọc câu tiếng Việt của khách và gọi tool "extract_search_filters" để trích ra tiêu chí tìm kiếm có cấu trúc.
Không tự trả lời khách, không tự bịa ra nhà, không giải thích - chỉ gọi tool.

${locationsPromptBlock()}

QUY TẮC QUY ĐỔI GIÁ (RẤT QUAN TRỌNG - hiểu theo NGHĨA ĐEN của con số, không phải cách nói lóng):
- "nghìn" (hoặc "ngàn") = x1.000 TWD. Ví dụ: "15 nghìn" = 15.000 TWD.
- "vạn" = x10.000 TWD. Ví dụ: "1 vạn rưỡi" = 15.000 TWD. "1000 vạn" = 10.000.000 TWD.
- "triệu" = x1.000.000 TWD theo ĐÚNG nghĩa đen. TUYỆT ĐỐI KHÔNG hiểu "triệu" thành "nghìn". Ví dụ: "15 triệu" = 15.000.000 TWD (không phải 15.000 TWD).
- Bảng quy đổi tham khảo: 10 nghìn = 1 vạn Đài tệ = 10.000 TWD | 100 nghìn = 10 vạn Đài tệ = 100.000 TWD | 1 triệu = 100 vạn Đài tệ = 1.000.000 TWD.
- Nếu khách ghi số đầy đủ có dấu phẩy/chấm như "15.000" hoặc "15000" thì hiểu thẳng là TWD, không nhân thêm.

Sau khi tính ra số TWD thực tế theo bảng trên, điền vào minPrice/maxPrice theo đúng loại giao dịch:
1) THUÊ NHÀ (listingType=rent): minPrice/maxPrice = đúng số TWD/tháng vừa tính được.
   Ví dụ: "khoảng 15 nghìn" -> 15000. "khoảng 1 vạn rưỡi" -> 15000.
2) MUA NHÀ (listingType=buy): giá lưu trong database theo đơn vị 萬 (vạn Đài tệ = 10.000 TWD), nên sau khi tính ra số TWD thực tế phải CHIA CHO 10.000 rồi mới điền vào minPrice/maxPrice.
   Ví dụ: "khoảng 1000 vạn" -> 10.000.000 TWD -> price=1000. "khoảng 15 triệu Đài tệ" (mua nhà) -> 15.000.000 TWD -> price=1500.

QUY TẮC KHÁC:
- Diện tích (minArea/maxArea) tính theo đơn vị 坪 (ping). Nếu khách nói m², tự đổi: 1 ping ≈ 3.3 m² (chia số m² cho 3.3).
- "2 phòng ngủ" / "2PN" -> bedrooms=2. "từ 3 phòng trở lên" / "ít nhất 3 phòng" -> bedroomsMin=3.
- "nhà mới" / "mới xây" -> maxAge nhỏ (vd 5 hoặc 10). "nhà cũ cũng được" -> không set age.
- Nếu khách không nói rõ thuê hay mua thì để trống listingType (hệ thống sẽ tìm cả hai).
- Nếu khách không nói rõ thành phố/quận thì để trống, KHÔNG được đoán bừa.
- requiredFeatures: chỉ liệt kê tiện ích khách nói RÕ là cần (máy giặt, ban công, thang máy, cho nuôi thú cưng, có nội thất, gần trường, gần chợ...). Không tự thêm tiện ích khách không nhắc tới.
- keyword: chỉ điền khi khách nhắc tên riêng cụ thể (tên ga MRT, khu công nghiệp, trường học, tên khu chung cư) để tìm gần đúng.
- Nếu câu của khách không liên quan gì đến tìm nhà (chào hỏi, hỏi lăng nhăng...), vẫn gọi tool nhưng để tất cả trường trống.`

const TOOL = {
  name: "extract_search_filters",
  description: "Trích xuất tiêu chí tìm nhà từ câu tiếng Việt thành dữ liệu có cấu trúc.",
  input_schema: {
    type: "object" as const,
    properties: {
      listingType: { type: "string", enum: ["rent", "buy", ""] },
      city: { type: "string", description: "Tên thành phố bằng chữ Hán phồn thể, khớp đúng danh sách cho sẵn, hoặc rỗng." },
      district: { type: "string", description: "Tên quận/huyện bằng chữ Hán phồn thể, phải thuộc đúng city đã chọn, hoặc rỗng." },
      propertyType: { type: "string", enum: [...PROPERTY_TYPE_VALUES, ""] },
      minPrice: { type: "number" },
      maxPrice: { type: "number" },
      minArea: { type: "number", description: "Diện tích tối thiểu, đơn vị ping" },
      maxArea: { type: "number", description: "Diện tích tối đa, đơn vị ping" },
      bedrooms: { type: "number", description: "Số phòng ngủ chính xác" },
      bedroomsMin: { type: "number", description: "Số phòng ngủ tối thiểu trở lên" },
      minAge: { type: "number" },
      maxAge: { type: "number" },
      parking: { type: "boolean", description: "true nếu khách yêu cầu bắt buộc có chỗ đậu xe" },
      requiredFeatures: { type: "array", items: { type: "string" } },
      keyword: { type: "string" },
    },
    required: [],
  },
}

async function callClaude(message: string): Promise<ParsedFilters> {
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
      system: SYSTEM_PROMPT,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "extract_search_filters" },
      messages: [{ role: "user", content: message }],
    }),
  })
  const data = await res.json()
  if (data?.type === "error") {
    throw new Error(`Anthropic API: ${data.error?.message || data.error?.type || "unknown error"}`)
  }
  const toolUse = data?.content?.find((b: any) => b.type === "tool_use")
  if (!toolUse) {
    throw new Error("Anthropic API không trả về tool_use hợp lệ")
  }
  return (toolUse.input || {}) as ParsedFilters
}

function clean(p: ParsedFilters): ParsedFilters {
  const out: ParsedFilters = { ...p }
  if (!out.listingType) delete out.listingType
  if (!out.city) delete out.city
  if (!out.district) delete out.district
  if (!out.propertyType) delete out.propertyType
  ;(["minPrice","maxPrice","minArea","maxArea","bedrooms","bedroomsMin","minAge","maxAge"] as const)
    .forEach(k => { if (out[k] == null || isNaN(out[k] as number) || (out[k] as number) <= 0) delete out[k] })
  if (out.parking !== true && out.parking !== false) delete out.parking
  if (!out.requiredFeatures?.length) delete out.requiredFeatures
  if (!out.keyword?.trim()) delete out.keyword
  return out
}

function toFilterOptions(p: ParsedFilters, sortBy: FilterOptions["sortBy"] = "newest"): FilterOptions {
  return {
    listingType: p.listingType,
    city: p.city,
    district: p.district,
    propertyType: p.propertyType,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    minArea: p.minArea,
    maxArea: p.maxArea,
    bedrooms: p.bedrooms,
    bedroomsMin: p.bedroomsMin,
    minAge: p.minAge,
    maxAge: p.maxAge,
    parking: p.parking,
    sortBy,
  }
}

// Lọc thêm theo tiện ích bắt buộc + từ khóa tự do (features/nearby không nằm trong FilterOptions gốc)
function applyExtras(list: Property[], p: ParsedFilters): Property[] {
  let out = list
  if (p.requiredFeatures?.length) {
    out = out.filter(prop => {
      const feats = [...(prop.features_vi || []), ...(prop.features || [])].join(" ").toLowerCase()
      return p.requiredFeatures!.every(f => feats.includes(f.toLowerCase()))
    })
  }
  if (p.keyword?.trim()) {
    const kw = p.keyword.trim().toLowerCase()
    out = out.filter(prop => {
      const hay = [
        prop.title_vi, prop.title_zh, prop.community_name, prop.address_vi, prop.address,
        prop.near_mrt_vi, prop.near_mrt, JSON.stringify(prop.nearby || {}),
      ].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(kw)
    })
  }
  return out
}

interface StageResult { results: Property[]; usedFilters: ParsedFilters; relaxedSteps: string[] }

// Tìm theo mục 14 trong đề xuất: nếu 0 kết quả thì nới lỏng dần, không trả "không tìm thấy" trơ trọi
async function stagedSearch(base: ParsedFilters): Promise<StageResult> {
  const stages: { drop: (keyof ParsedFilters)[]; label: string }[] = [
    { drop: [], label: "" },
    { drop: ["requiredFeatures", "keyword"], label: "bỏ bớt tiện ích/khu vực cụ thể" },
    { drop: ["minAge", "maxAge", "parking"], label: "bỏ điều kiện tuổi nhà/chỗ đậu xe" },
    { drop: ["minArea", "maxArea"], label: "bỏ điều kiện diện tích" },
    { drop: ["district"], label: "mở rộng ra cả thành phố (bỏ quận/huyện)" },
    { drop: ["propertyType"], label: "bỏ điều kiện loại nhà" },
  ]

  const relaxedSteps: string[] = []
  let current: ParsedFilters = { ...base }

  for (const stage of stages) {
    if (stage.label) {
      stage.drop.forEach(k => delete current[k])
      relaxedSteps.push(stage.label)
    }
    const merged = await searchProperties(toFilterOptions(current))
    const filtered = applyExtras(merged, current)
    if (filtered.length > 0) {
      return { results: filtered, usedFilters: current, relaxedSteps: stage.label ? relaxedSteps : [] }
    }
  }
  return { results: [], usedFilters: current, relaxedSteps }
}

// Dựng URL /listings tương thích với schema query param sẵn có trong app/listings/page.tsx
function buildListingsUrl(p: ParsedFilters): string {
  const sp = new URLSearchParams()
  if (p.listingType) sp.set("type", p.listingType)
  if (p.city) sp.set("city", p.city)
  if (p.district) sp.set("district", p.district)
  if (p.propertyType) sp.set("property_type", p.propertyType)
  if (p.minPrice || p.maxPrice) sp.set("price", `${p.minPrice || 0}-${p.maxPrice || 0}`)
  if (p.minArea || p.maxArea) sp.set("area", `${p.minArea || 0}-${p.maxArea || 0}`)
  if (p.minAge || p.maxAge) sp.set("age", `${p.minAge || 0}-${p.maxAge || 0}`)
  if (p.bedroomsMin === 5) sp.set("rooms", "5+")
  else if (p.bedrooms) sp.set("rooms", String(p.bedrooms))
  if (p.parking === true) sp.set("parking", "yes")
  if (p.parking === false) sp.set("parking", "no")
  const qs = sp.toString()
  return qs ? `/listings?${qs}` : "/listings"
}

function buildSummary(p: ParsedFilters): string[] {
  const chips: string[] = []
  if (p.listingType) chips.push(p.listingType === "rent" ? "🏠 Thuê nhà" : "🏡 Mua nhà")
  if (p.city) {
    const cityVi = CITIES.find(c => c.zh === p.city)?.vi
    const distVi = p.district ? DISTRICTS[p.city]?.find(d => d.zh === p.district)?.vi : undefined
    chips.push(`📍 ${distVi ? distVi + ", " : ""}${cityVi || p.city}`)
  }
  if (p.propertyType) {
    const t = PROPERTY_TYPES.find(t => t.val === p.propertyType)
    if (t) chips.push(`🏢 ${t.vi}`)
  }
  if (p.minPrice || p.maxPrice) {
    const unit = p.listingType === "buy" ? "vạn" : ""
    const suffix = p.listingType === "rent" ? "/tháng" : ""
    if (p.minPrice && p.maxPrice) chips.push(`💰 ${p.minPrice.toLocaleString()} - ${p.maxPrice.toLocaleString()} ${unit}${suffix}`)
    else if (p.maxPrice) chips.push(`💰 Dưới ${p.maxPrice.toLocaleString()} ${unit}${suffix}`)
    else if (p.minPrice) chips.push(`💰 Trên ${p.minPrice.toLocaleString()} ${unit}${suffix}`)
  }
  if (p.bedroomsMin) chips.push(`🛏 Từ ${p.bedroomsMin} phòng ngủ`)
  else if (p.bedrooms) chips.push(`🛏 ${p.bedrooms} phòng ngủ`)
  if (p.parking === true) chips.push("🚗 Có chỗ đậu xe")
  if (p.requiredFeatures?.length) chips.push(`✨ ${p.requiredFeatures.join(", ")}`)
  if (p.keyword) chips.push(`🔎 ${p.keyword}`)
  return chips
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: "empty_message" }, { status: 400 })
    }

    const raw = await callClaude(message)
    const parsed = clean(raw)

    const noCriteria = Object.keys(parsed).length === 0
    if (noCriteria) {
      return NextResponse.json({
        understood: false,
        summary: [],
        results: [],
        totalCount: 0,
        listingsUrl: "/listings",
        relaxedSteps: [],
      })
    }

    const { results, usedFilters, relaxedSteps } = await stagedSearch(parsed)

    return NextResponse.json({
      understood: true,
      summary: buildSummary(parsed),
      usedSummary: relaxedSteps.length ? buildSummary(usedFilters) : undefined,
      results: results.slice(0, 6),
      totalCount: results.length,
      listingsUrl: buildListingsUrl(relaxedSteps.length ? usedFilters : parsed),
      relaxedSteps,
    })
  } catch (err: any) {
    console.error("ai-search error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
