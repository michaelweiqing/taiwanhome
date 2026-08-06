// lib/locations.ts
// Danh sách thành phố / quận huyện (zh ⇄ vi) dùng để AI Search map đúng tên
// tiếng Việt người dùng gõ sang tên tiếng Trung lưu trong Supabase.
// Nguồn: đồng bộ với danh sách CITIES/DISTRICTS trong app/HomeClient.tsx

export const CITIES: { zh: string; vi: string }[] = [
  { zh: "台北市", vi: "Đài Bắc" },
  { zh: "新北市", vi: "Tân Bắc" },
  { zh: "桃園市", vi: "Đào Viên" },
  { zh: "新竹市", vi: "Tân Trúc" },
  { zh: "台中市", vi: "Đài Trung" },
  { zh: "彰化縣", vi: "Chương Hóa" },
  { zh: "台南市", vi: "Đài Nam" },
  { zh: "高雄市", vi: "Cao Hùng" },
]

export const DISTRICTS: Record<string, { zh: string; vi: string }[]> = {
  "台北市": [
    { zh:"中正區", vi:"Trung Chính" }, { zh:"大安區", vi:"Đại An" },
    { zh:"信義區", vi:"Tín Nghĩa" },   { zh:"松山區", vi:"Tùng Sơn" },
    { zh:"內湖區", vi:"Nội Hồ" },      { zh:"士林區", vi:"Sĩ Lâm" },
    { zh:"北投區", vi:"Bắc Đầu" },     { zh:"文山區", vi:"Văn Sơn" },
    { zh:"南港區", vi:"Nam Cảng" },    { zh:"中山區", vi:"Trung Sơn" },
    { zh:"萬華區", vi:"Vạn Hoa" },     { zh:"大同區", vi:"Đại Đồng" },
  ],
  "新北市": [
    { zh:"板橋區", vi:"Bản Kiều" },   { zh:"三重區", vi:"Tam Trọng" },
    { zh:"中和區", vi:"Trung Hòa" },  { zh:"永和區", vi:"Vĩnh Hòa" },
    { zh:"新莊區", vi:"Tân Trang" },  { zh:"新店區", vi:"Tân Điếm" },
    { zh:"土城區", vi:"Thổ Thành" },  { zh:"蘆洲區", vi:"Lô Châu" },
    { zh:"樹林區", vi:"Thụ Lâm" },    { zh:"汐止區", vi:"Uông Chỉ" },
    { zh:"鶯歌區", vi:"Oanh Ca" },    { zh:"三峽區", vi:"Tam Hiệp" },
    { zh:"淡水區", vi:"Đạm Thủy" },   { zh:"瑞芳區", vi:"Thụy Phương" },
  ],
  "桃園市": [
    { zh:"桃園區", vi:"Đào Viên" },   { zh:"中壢區", vi:"Trung Lịch" },
    { zh:"平鎮區", vi:"Bình Trấn" },  { zh:"八德區", vi:"Bát Đức" },
    { zh:"楊梅區", vi:"Dương Mai" },  { zh:"蘆竹區", vi:"Lô Trúc" },
    { zh:"龜山區", vi:"Quy Sơn" },    { zh:"大溪區", vi:"Đại Khê" },
    { zh:"大園區", vi:"Đại Viên" },   { zh:"觀音區", vi:"Quan Âm" },
  ],
  "新竹市": [
    { zh:"東區", vi:"Khu Đông" },
    { zh:"北區", vi:"Khu Bắc" },
    { zh:"香山區", vi:"Hương Sơn" },
  ],
  "台中市": [
    { zh:"中區",   vi:"Khu Trung" },   { zh:"東區",   vi:"Khu Đông" },
    { zh:"西區",   vi:"Khu Tây" },     { zh:"南區",   vi:"Khu Nam" },
    { zh:"北區",   vi:"Khu Bắc" },     { zh:"西屯區", vi:"Tây Đồn" },
    { zh:"南屯區", vi:"Nam Đồn" },     { zh:"北屯區", vi:"Bắc Đồn" },
    { zh:"豐原區", vi:"Phong Nguyên" },{ zh:"大里區", vi:"Đại Lý" },
    { zh:"太平區", vi:"Thái Bình" },   { zh:"清水區", vi:"Thanh Thủy" },
    { zh:"沙鹿區", vi:"Sa Lộc" },      { zh:"大甲區", vi:"Đại Giáp" },
    { zh:"東勢區", vi:"Đông Thế" },    { zh:"梧棲區", vi:"Ngô Thê" },
    { zh:"烏日區", vi:"Ô Nhật" },      { zh:"神岡區", vi:"Thần Cương" },
    { zh:"大肚區", vi:"Đại Độ" },      { zh:"大雅區", vi:"Đại Nhã" },
    { zh:"后里區", vi:"Hậu Lý" },      { zh:"霧峰區", vi:"Vụ Phong" },
    { zh:"潭子區", vi:"Đàm Tử" },      { zh:"龍井區", vi:"Long Tỉnh" },
    { zh:"外埔區", vi:"Ngoại Phố" },   { zh:"和平區", vi:"Hòa Bình" },
    { zh:"石岡區", vi:"Thạch Cương" }, { zh:"大安區", vi:"Đại An" },
    { zh:"新社區", vi:"Tân Xã" },
  ],
  "彰化縣": [
    { zh:"彰化市", vi:"Chương Hóa" },  { zh:"員林市", vi:"Viên Lâm" },
    { zh:"鹿港鎮", vi:"Lộc Cảng" },    { zh:"和美鎮", vi:"Hòa Mỹ" },
    { zh:"北斗鎮", vi:"Bắc Đẩu" },     { zh:"溪湖鎮", vi:"Khê Hồ" },
    { zh:"田中鎮", vi:"Điền Trung" },  { zh:"二林鎮", vi:"Nhị Lâm" },
    { zh:"線西鄉", vi:"Tuyến Tây" },   { zh:"伸港鄉", vi:"Thân Cảng" },
    { zh:"福興鄉", vi:"Phúc Hưng" },   { zh:"秀水鄉", vi:"Tú Thủy" },
    { zh:"花壇鄉", vi:"Hoa Đàn" },     { zh:"芬園鄉", vi:"Phân Viên" },
    { zh:"大村鄉", vi:"Đại Thôn" },    { zh:"埔鹽鄉", vi:"Bộ Diêm" },
    { zh:"埔心鄉", vi:"Bộ Tâm" },      { zh:"永靖鄉", vi:"Vĩnh Tĩnh" },
    { zh:"社頭鄉", vi:"Xã Đầu" },      { zh:"二水鄉", vi:"Nhị Thủy" },
    { zh:"田尾鄉", vi:"Điền Vĩ" },     { zh:"埤頭鄉", vi:"Bi Đầu" },
    { zh:"芳苑鄉", vi:"Phương Uyển" }, { zh:"大城鄉", vi:"Đại Thành" },
    { zh:"竹塘鄉", vi:"Trúc Đường" },  { zh:"溪州鄉", vi:"Khê Châu" },
  ],
  "台南市": [
    { zh:"東區", vi:"Khu Đông" },    { zh:"西區", vi:"Khu Tây" },
    { zh:"南區", vi:"Khu Nam" },     { zh:"北區", vi:"Khu Bắc" },
    { zh:"安平區", vi:"An Bình" },   { zh:"安南區", vi:"An Nam" },
    { zh:"永康區", vi:"Vĩnh Khang" },{ zh:"仁德區", vi:"Nhân Đức" },
    { zh:"歸仁區", vi:"Quy Nhân" },  { zh:"新化區", vi:"Tân Hóa" },
    { zh:"善化區", vi:"Thiện Hóa" }, { zh:"麻豆區", vi:"Ma Đậu" },
  ],
  "高雄市": [
    { zh:"三民區", vi:"Tam Dân" },    { zh:"苓雅區", vi:"Linh Nhã" },
    { zh:"前鎮區", vi:"Tiền Trấn" },  { zh:"鼓山區", vi:"Cổ Sơn" },
    { zh:"左營區", vi:"Tả Doanh" },   { zh:"楠梓區", vi:"Nam Tử" },
    { zh:"鳳山區", vi:"Phụng Sơn" },  { zh:"仁武區", vi:"Nhân Vũ" },
    { zh:"大社區", vi:"Đại Xã" },     { zh:"岡山區", vi:"Cương Sơn" },
    { zh:"路竹區", vi:"Lộ Trúc" },    { zh:"旗山區", vi:"Kỳ Sơn" },
  ],
}

export const PROPERTY_TYPES: { val: string; zh: string; vi: string }[] = [
  { val:"apartment_walkup", zh:"公寓(無電梯)", vi:"Chung cư thang bộ (không thang máy)" },
  { val:"apartment",        zh:"電梯大樓/華廈", vi:"Chung cư thang máy" },
  { val:"house",            zh:"透天厝",        vi:"Nhà nguyên căn/nhà phố" },
  { val:"studio",           zh:"套房",          vi:"Phòng trọ/studio" },
  { val:"villa",            zh:"套房/雅房",     vi:"Phòng đơn" },
  { val:"shop",             zh:"店面",          vi:"Mặt bằng kinh doanh" },
  { val:"land",             zh:"土地",          vi:"Đất" },
  { val:"factory",          zh:"廠房",          vi:"Nhà xưởng/công xưởng" },
]

// Chuỗi gọn để nhúng vào system prompt cho AI parser (tránh lặp code format ở nhiều nơi)
export function locationsPromptBlock(): string {
  const cityLines = CITIES.map(c => `${c.zh} = ${c.vi}`).join(", ")
  const districtLines = Object.entries(DISTRICTS)
    .map(([cityZh, ds]) => `  [${cityZh}]: ` + ds.map(d => `${d.zh}(${d.vi})`).join(", "))
    .join("\n")
  const typeLines = PROPERTY_TYPES.map(t => `${t.val} = ${t.zh} / ${t.vi}`).join("\n  ")
  return `THÀNH PHỐ (zh = vi): ${cityLines}

QUẬN/HUYỆN theo từng thành phố (chỉ chọn quận nằm đúng trong thành phố đã xác định):
${districtLines}

LOẠI NHÀ (property_type):
  ${typeLines}`
}
