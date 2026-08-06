// lib/aiSearch.ts
// Lõi dùng chung cho 8386 AI (Giai đoạn 2-3): parse hội thoại nhiều lượt bằng
// tiếng Việt, tìm kiếm + nới lỏng dần, tính "8386 AI Score", câu hỏi ngược.
// Dùng chung bởi: app/api/ai-search, app/api/ai-search/subscribe, app/api/cron/match-subscriptions
import { searchProperties, type FilterOptions, type Property } from "@/lib/data"
import { CITIES, DISTRICTS, PROPERTY_TYPES, locationsPromptBlock } from "@/lib/locations"

export interface ParsedFilters {
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
  requiredFeatures?: string[]   // tiện ích BẮT BUỘC — lọc cứng
  preferredFeatures?: string[]  // tiện ích ƯU TIÊN — chỉ tính điểm, không loại nhà
  keyword?: string
  groupSize?: "1" | "2" | "family" | "group"
}

export interface ChecklistItem { label: string; met: boolean; soft: boolean }
export interface ScoredProperty { property: Property; score: number; checklist: ChecklistItem[] }
export interface StageResult { results: Property[]; usedFilters: ParsedFilters; relaxedSteps: string[] }
export interface FollowUp { question: string; options: string[] }

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
2) MUA NHÀ (listingType=buy): giá lưu trong database theo đơn vị 萬 (vạn Đài tệ = 10.000 TWD), nên sau khi tính ra số TWD thực tế phải CHIA CHO 10.000 rồi mới điền vào minPrice/maxPrice.
   Ví dụ: "khoảng 1000 vạn" -> 10.000.000 TWD -> price=1000. "khoảng 15 triệu Đài tệ" (mua nhà) -> 15.000.000 TWD -> price=1500.

BẮT BUỘC vs ƯU TIÊN (rất quan trọng để tính điểm phù hợp sau này):
- requiredFeatures: tiện ích khách nói RÕ là PHẢI CÓ, không thương lượng (vd "cần có máy giặt", "bắt buộc có ban công").
- preferredFeatures: tiện ích khách nói là "nếu có thì tốt/càng tốt/ưu tiên" (vd "nếu có thang máy thì càng tốt" -> preferredFeatures=["thang máy"], KHÔNG cho vào requiredFeatures).
- Tương tự: nếu khách nói "ưu tiên gần MRT" thì đó là preferredFeatures/keyword mềm, không phải điều kiện loại trừ.

SỐ NGƯỜI Ở (groupSize) — chỉ set khi khách nói rõ:
- "ở một mình" / "1 người" -> groupSize="1"
- "hai vợ chồng" / "2 người" / "cặp đôi" -> groupSize="2"
- "gia đình" / "có con nhỏ" / "bố mẹ" -> groupSize="family"
- "nhóm bạn" / "ở ghép" / "mấy anh em" -> groupSize="group"

HỘI THOẠI NHIỀU LƯỢT: nếu tin nhắn có kèm khối "BỘ LỌC HIỆN TẠI" (JSON), nghĩa là khách đang tiếp tục cuộc trò chuyện trước đó. Hãy hiểu câu mới là ĐIỀU CHỈNH so với bộ lọc đó:
- Giữ nguyên mọi trường không được nhắc tới trong câu mới.
- "rẻ hơn" / "giảm giá xuống" -> giảm maxPrice hiện tại khoảng 15-20% (nếu chưa có maxPrice thì không tự bịa).
- "thêm chỗ đậu xe" / "cần thêm ban công" -> thêm vào requiredFeatures hoặc set parking=true, giữ nguyên các trường khác.
- "không cần N phòng nữa, M phòng cũng được" -> cập nhật bedrooms/bedroomsMin theo M, xoá ràng buộc N cũ.
- "đổi sang mua nhà" / "đổi sang thuê" -> đổi listingType, và tự quy đổi lại đơn vị giá theo quy tắc ở trên nếu khách có nhắc lại giá.

QUY TẮC KHÁC:
- Diện tích (minArea/maxArea) tính theo đơn vị 坪 (ping). Nếu khách nói m², tự đổi: 1 ping ≈ 3.3 m² (chia số m² cho 3.3).
- "2 phòng ngủ" / "2PN" -> bedrooms=2. "từ 3 phòng trở lên" / "ít nhất 3 phòng" -> bedroomsMin=3.
- "nhà mới" / "mới xây" -> maxAge nhỏ (vd 5 hoặc 10). "nhà cũ cũng được" -> không set age.
- Nếu khách không nói rõ thành phố/quận thì để trống, KHÔNG được đoán bừa.
- keyword: chỉ điền khi khách nhắc tên riêng cụ thể (tên ga MRT, khu công nghiệp, trường học, tên khu chung cư, tên chỗ làm) để tìm gần đúng.
- Nếu câu của khách không liên quan gì đến tìm nhà (chào hỏi, hỏi lăng nhăng...), vẫn gọi tool nhưng để tất cả trường trống.
- listingType: chỉ để trống khi khách THỰC SỰ không có ý định nói rõ (vd chỉ chào hỏi). Nếu khách đã từng nói trong BỘ LỌC HIỆN TẠI hoặc lượt trước thì giữ nguyên.`

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
      requiredFeatures: { type: "array", items: { type: "string" }, description: "Tiện ích BẮT BUỘC" },
      preferredFeatures: { type: "array", items: { type: "string" }, description: "Tiện ích ƯU TIÊN, không bắt buộc" },
      keyword: { type: "string" },
      groupSize: { type: "string", enum: ["1", "2", "family", "group", ""] },
    },
    required: [],
  },
}

export async function callClaude(message: string, previousFilters?: ParsedFilters): Promise<ParsedFilters> {
  const userContent = previousFilters && Object.keys(previousFilters).length > 0
    ? `BỘ LỌC HIỆN TẠI: ${JSON.stringify(previousFilters)}\n\nCâu mới của khách: "${message}"`
    : message

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
      messages: [{ role: "user", content: userContent }],
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

export function clean(p: ParsedFilters): ParsedFilters {
  const out: ParsedFilters = { ...p }
  if (!out.listingType) delete out.listingType
  if (!out.city) delete out.city
  if (!out.district) delete out.district
  if (!out.propertyType) delete out.propertyType
  if (!out.groupSize) delete out.groupSize
  ;(["minPrice","maxPrice","minArea","maxArea","bedrooms","bedroomsMin","minAge","maxAge"] as const)
    .forEach(k => { if (out[k] == null || isNaN(out[k] as number) || (out[k] as number) <= 0) delete out[k] })
  if (out.parking !== true && out.parking !== false) delete out.parking
  if (!out.requiredFeatures?.length) delete out.requiredFeatures
  if (!out.preferredFeatures?.length) delete out.preferredFeatures
  if (!out.keyword?.trim()) delete out.keyword

  // groupSize chỉ là gợi ý mềm về số phòng khi khách chưa nói rõ số phòng cụ thể
  if (out.groupSize && out.bedrooms == null && out.bedroomsMin == null) {
    if (out.groupSize === "family") out.bedroomsMin = 2
    else if (out.groupSize === "group") out.bedroomsMin = 2
  }
  return out
}

export function toFilterOptions(p: ParsedFilters, sortBy: FilterOptions["sortBy"] = "newest"): FilterOptions {
  return {
    listingType: p.listingType, city: p.city, district: p.district, propertyType: p.propertyType,
    minPrice: p.minPrice, maxPrice: p.maxPrice, minArea: p.minArea, maxArea: p.maxArea,
    bedrooms: p.bedrooms, bedroomsMin: p.bedroomsMin, minAge: p.minAge, maxAge: p.maxAge,
    parking: p.parking, sortBy,
  }
}

// Lọc thêm theo tiện ích BẮT BUỘC + từ khóa tự do (features/nearby không nằm trong FilterOptions gốc)
// preferredFeatures KHÔNG lọc cứng ở đây — chỉ dùng để tính điểm trong scoreProperty()
export function applyExtras(list: Property[], p: ParsedFilters): Property[] {
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

// Tìm theo mục 14 trong đề xuất: nếu 0 kết quả thì nới lỏng dần, không trả "không tìm thấy" trơ trọi
export async function stagedSearch(base: ParsedFilters): Promise<StageResult> {
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

export interface AlternativeOption { label: string; count: number; filters: ParsedFilters }

// Phương án thay thế bổ sung (mục 14): mở ngân sách +30% trên chính bộ lọc gốc (không nới các điều kiện khác)
export async function buildBudgetAlternative(original: ParsedFilters): Promise<AlternativeOption | null> {
  if (original.maxPrice == null) return null
  const widened: ParsedFilters = { ...original, maxPrice: Math.round(original.maxPrice * 1.3) }
  const merged = await searchProperties(toFilterOptions(widened))
  const filtered = applyExtras(merged, widened)
  if (filtered.length === 0) return null
  return { label: "Mở rộng ngân sách thêm 30%", count: filtered.length, filters: widened }
}

// Dựng URL /listings tương thích với schema query param sẵn có trong app/listings/page.tsx
export function buildListingsUrl(p: ParsedFilters): string {
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

export function buildSummary(p: ParsedFilters): string[] {
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
  if (p.requiredFeatures?.length) chips.push(`✨ Bắt buộc: ${p.requiredFeatures.join(", ")}`)
  if (p.preferredFeatures?.length) chips.push(`💡 Ưu tiên: ${p.preferredFeatures.join(", ")}`)
  if (p.keyword) chips.push(`🔎 ${p.keyword}`)
  return chips
}

// "8386 AI Score" — tính điểm % phù hợp DỰA TRÊN BỘ LỌC GỐC (trước khi nới lỏng), không để AI tự chấm
// để tránh AI "tự bịa" mức độ phù hợp. Trả về cả checklist 🟢/🟡 để giải thích "vì sao phù hợp".
export function scoreProperty(p: Property, original: ParsedFilters): ScoredProperty {
  const items: (ChecklistItem & { weight: number })[] = []
  const add = (label: string, met: boolean, weight = 1, soft = false) => items.push({ label, met, soft, weight })

  if (original.listingType)
    add(original.listingType === "rent" ? "Đúng nhu cầu thuê nhà" : "Đúng nhu cầu mua nhà", p.listing_type === original.listingType, 3)
  if (original.city) {
    const cityVi = CITIES.find(c => c.zh === original.city)?.vi || original.city
    add(`Đúng thành phố ${cityVi}`, p.city === original.city, 3)
  }
  if (original.district) {
    const distVi = DISTRICTS[original.city || ""]?.find(d => d.zh === original.district)?.vi || original.district
    add(`Đúng khu vực ${distVi}`, p.district === original.district, 2)
  }
  if (original.propertyType) add("Đúng loại nhà", p.property_type === original.propertyType, 2)

  if (original.minPrice != null || original.maxPrice != null) {
    const price = Number(p.price)
    const ok = (original.minPrice == null || price >= original.minPrice) && (original.maxPrice == null || price <= original.maxPrice)
    add("Đúng ngân sách", ok, 3)
  }
  if (original.bedroomsMin != null) add(`Từ ${original.bedroomsMin} phòng ngủ trở lên`, p.bedrooms >= original.bedroomsMin, 2)
  else if (original.bedrooms != null) add(`${original.bedrooms} phòng ngủ`, p.bedrooms === original.bedrooms, 2)
  if (original.minArea != null || original.maxArea != null) {
    const area = Number(p.area_ping)
    const ok = (original.minArea == null || area >= original.minArea) && (original.maxArea == null || area <= original.maxArea)
    add("Đúng diện tích", ok, 1)
  }
  if (original.minAge != null || original.maxAge != null) {
    const ok = (original.minAge == null || p.age >= original.minAge) && (original.maxAge == null || p.age <= original.maxAge)
    add("Đúng tuổi nhà", ok, 1)
  }
  if (original.parking === true) add("Có chỗ đậu xe", p.parking === true, 1)

  const featText = [...(p.features_vi || []), ...(p.features || [])].join(" ").toLowerCase()
  original.requiredFeatures?.forEach(f => add(f, featText.includes(f.toLowerCase()), 1))
  original.preferredFeatures?.forEach(f => add(f, featText.includes(f.toLowerCase()), 0.5, true))

  if (original.keyword) {
    const hay = [p.title_vi, p.title_zh, p.community_name, p.address_vi, p.address, p.near_mrt_vi, p.near_mrt, JSON.stringify(p.nearby || {})]
      .filter(Boolean).join(" ").toLowerCase()
    add(`Gần "${original.keyword}"`, hay.includes(original.keyword.toLowerCase()), 1)
  }

  if (items.length === 0) return { property: p, score: 100, checklist: [] }
  const totalWeight = items.reduce((s, c) => s + c.weight, 0)
  const metWeight = items.filter(c => c.met).reduce((s, c) => s + c.weight, 0)
  const score = Math.max(1, Math.round((metWeight / totalWeight) * 100))
  return { property: p, score, checklist: items.map(({ label, met, soft }) => ({ label, met, soft })) }
}

// Câu hỏi ngược (mục 4) — chỉ hỏi khi thực sự cần và chỉ hỏi 1 lần/hội thoại (do frontend kiểm soát qua followUpRound)
// Chỉ hỏi "thuê hay mua" vì đây là thứ duy nhất bắt buộc phải biết để quy đổi giá đúng đơn vị.
export function nextFollowUp(p: ParsedFilters, followUpRound: number): FollowUp | null {
  if (followUpRound > 0) return null
  if (!p.listingType) {
    return { question: "Bạn muốn thuê hay mua nhà? 🏠", options: ["🏠 Thuê nhà", "🏡 Mua nhà", "🤝 Cả hai đều được"] }
  }
  return null
}
