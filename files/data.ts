// lib/data.ts — Dữ liệu + kiểu TypeScript cho bất động sản

export interface Property {
  id: string
  titleZh: string
  titleVi: string
  district: string
  districtVi: string
  address: string
  addressVi: string
  city: string
  cityVi: string
  listingType: "rent" | "buy"
  propertyType: "apartment" | "house" | "studio" | "villa"
  price: number           // NTD/tháng (rent) hoặc 萬 NTD (buy)
  pricePerPing?: number   // Giá mỗi 坪 — chỉ cho buy
  areaPing: number        // 1 坪 ≈ 3.306 m²
  bedrooms: number
  bathrooms: number
  floor: number
  totalFloors: number
  age: number             // Tuổi nhà (năm)
  facing: string          // Hướng nhà
  features: string[]      // Tiếng Trung
  featuresVi: string[]    // Tiếng Việt
  nearMRT: string
  nearMRTVi: string
  walkMinutes: number
  images: string[]
  agentName: string
  agentPhone: string
  agentLine: string
  isNew: boolean
  isFeatured: boolean
  views: number
  postedAt: string
  lat: number
  lng: number
  descriptionZh: string
  descriptionVi: string
}

export const properties: Property[] = [
  {
    id: "tp-001",
    titleZh: "信義區精緻兩房，近捷運市政府站",
    titleVi: "Căn hộ 2PN quận Xinyi, gần MRT Thị Chính",
    district: "信義區", districtVi: "Quận Xinyi",
    address: "台北市信義區忠孝東路五段", addressVi: "Đường Zhongxiao Đông, Q.Xinyi, Đài Bắc",
    city: "台北市", cityVi: "Đài Bắc",
    listingType: "rent", propertyType: "apartment",
    price: 35000, areaPing: 28,
    bedrooms: 2, bathrooms: 1, floor: 8, totalFloors: 12, age: 8, facing: "東南",
    features: ["電梯", "停車位", "管理員", "陽台", "冷氣"],
    featuresVi: ["Thang máy", "Chỗ đậu xe", "Bảo vệ 24h", "Ban công", "Điều hoà"],
    nearMRT: "市政府站", nearMRTVi: "Ga Thị Chính", walkMinutes: 5,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85",
    ],
    agentName: "王大明", agentPhone: "0912-345-678", agentLine: "minghouse",
    isNew: true, isFeatured: true, views: 342, postedAt: "2025-05-20T10:00:00Z",
    lat: 25.0408, lng: 121.5647,
    descriptionZh: "位於信義區精華地段，步行5分鐘即可到達捷運市政府站。屋況新穎，採光良好，格局方正。社區有管理員及停車位，生活機能完善，周邊有百貨公司、餐廳、超市等，生活便利。",
    descriptionVi: "Vị trí đắc địa tại quận Xinyi, đi bộ 5 phút đến ga MRT. Căn hộ mới, nhiều ánh sáng, mặt bằng vuông vắn. Tòa nhà có bảo vệ và chỗ đậu xe. Xung quanh có trung tâm thương mại, nhà hàng, siêu thị tiện lợi.",
  },
  {
    id: "tp-002",
    titleZh: "大安區三房兩廳豪華電梯大廈",
    titleVi: "Căn hộ 3PN cao cấp thang máy quận Da'an",
    district: "大安區", districtVi: "Quận Da'an",
    address: "台北市大安區敦化南路二段", addressVi: "Đường Dunhua Nam, Q.Da'an, Đài Bắc",
    city: "台北市", cityVi: "Đài Bắc",
    listingType: "buy", propertyType: "apartment",
    price: 2580, pricePerPing: 61, areaPing: 42,
    bedrooms: 3, bathrooms: 2, floor: 5, totalFloors: 14, age: 3, facing: "南",
    features: ["電梯", "停車位", "健身房", "游泳池", "管理員", "寵物友善"],
    featuresVi: ["Thang máy", "Chỗ đậu xe", "Phòng gym", "Hồ bơi", "Bảo vệ 24h", "Thú cưng OK"],
    nearMRT: "大安森林公園站", nearMRTVi: "Ga Công viên rừng Da'an", walkMinutes: 8,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=85",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=85",
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=900&q=85",
    ],
    agentName: "林美玲", agentPhone: "0923-456-789", agentLine: "mei_house",
    isNew: false, isFeatured: true, views: 891, postedAt: "2025-05-15T09:00:00Z",
    lat: 25.0330, lng: 121.5439,
    descriptionZh: "大安區頂級住宅，緊鄰大安森林公園，環境清幽。社區設施完善，含健身房、游泳池及24小時管理員。三房格局實用，主臥室附更衣室。屋齡僅3年，屋況如新。",
    descriptionVi: "Căn hộ cao cấp quận Da'an, sát công viên rừng Da'an. Tiện ích: gym, hồ bơi, bảo vệ 24h. Layout 3PN thực dụng, phòng master có walk-in closet. Nhà chỉ 3 tuổi, tình trạng như mới.",
  },
  {
    id: "tc-001",
    titleZh: "台中七期豪宅，鄰近秋紅谷",
    titleVi: "Biệt thự khu 7 Đài Trung, gần công viên Qiuhong",
    district: "西屯區", districtVi: "Quận Xitun",
    address: "台中市西屯區市政北二路", addressVi: "Đường Shizheng Bắc, Xitun, Đài Trung",
    city: "台中市", cityVi: "Đài Trung",
    listingType: "buy", propertyType: "villa",
    price: 5800, pricePerPing: 89, areaPing: 65,
    bedrooms: 4, bathrooms: 3, floor: 10, totalFloors: 28, age: 2, facing: "西南",
    features: ["電梯", "停車位", "健身房", "游泳池", "頂樓花園", "智慧門禁"],
    featuresVi: ["Thang máy", "Chỗ đậu xe", "Gym", "Hồ bơi", "Vườn sân thượng", "Cổng thông minh"],
    nearMRT: "台中捷運市政府站", nearMRTVi: "Ga MRT Thị Chính Đài Trung", walkMinutes: 10,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=85",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=900&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
    ],
    agentName: "陳俊宏", agentPhone: "0934-567-890", agentLine: "jun_realty",
    isNew: true, isFeatured: true, views: 1203, postedAt: "2025-05-22T08:00:00Z",
    lat: 24.1631, lng: 120.6478,
    descriptionZh: "台中七期豪宅，台灣頂級豪宅地段之一。鄰近秋紅谷景觀公園，視野開闊，景觀絕佳。頂樓空中花園夜景無敵，智慧門禁系統，安全有保障。格局寬敞，4房3衛，主臥室超大更衣間。",
    descriptionVi: "Biệt thự đẳng cấp khu 7 Đài Trung. Gần công viên Qiuhong, tầm nhìn đẹp. Vườn sân thượng ngắm cảnh đêm tuyệt vời, hệ thống cổng thông minh an toàn. Layout 4PN 3WC, walk-in closet phòng master.",
  },
  {
    id: "ks-001",
    titleZh: "高雄左營捷運套房，近高鐵站",
    titleVi: "Studio Zuoying Cao Hùng, gần ga HSR",
    district: "左營區", districtVi: "Quận Zuoying",
    address: "高雄市左營區高鐵路", addressVi: "Đường Gaotie, Zuoying, Cao Hùng",
    city: "高雄市", cityVi: "Cao Hùng",
    listingType: "rent", propertyType: "studio",
    price: 12000, areaPing: 10,
    bedrooms: 1, bathrooms: 1, floor: 3, totalFloors: 7, age: 6, facing: "北",
    features: ["電梯", "網路", "冷氣", "洗衣機", "近高鐵"],
    featuresVi: ["Thang máy", "Wifi miễn phí", "Điều hoà", "Máy giặt", "Gần HSR"],
    nearMRT: "左營站", nearMRTVi: "Ga Zuoying (HSR+MRT)", walkMinutes: 3,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=85",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85",
    ],
    agentName: "黃小芳", agentPhone: "0945-678-901", agentLine: "ks_rent",
    isNew: false, isFeatured: false, views: 156, postedAt: "2025-05-18T14:00:00Z",
    lat: 22.6877, lng: 120.3039,
    descriptionZh: "左營捷運站步行3分鐘，交通超便利！套房含網路、冷氣、洗衣機，拎包即住。近高鐵左營站，往返台北台中非常方便，適合上班族。",
    descriptionVi: "Đi bộ 3 phút đến ga MRT Zuoying! Studio full nội thất: wifi, điều hoà, máy giặt. Gần ga tàu cao tốc HSR, đi Đài Bắc – Đài Trung rất thuận tiện. Phù hợp người đi làm.",
  },
  {
    id: "tp-003",
    titleZh: "中山區全新裝潢兩房，近林森商圈",
    titleVi: "Căn hộ 2PN nội thất mới quận Zhongshan",
    district: "中山區", districtVi: "Quận Zhongshan",
    address: "台北市中山區林森北路", addressVi: "Đường Linsen Bắc, Q.Zhongshan, Đài Bắc",
    city: "台北市", cityVi: "Đài Bắc",
    listingType: "rent", propertyType: "apartment",
    price: 28000, areaPing: 22,
    bedrooms: 2, bathrooms: 1, floor: 6, totalFloors: 10, age: 12, facing: "東",
    features: ["電梯", "全新裝潢", "網路", "冷氣", "近商圈"],
    featuresVi: ["Thang máy", "Nội thất mới", "Wifi", "Điều hoà", "Gần trung tâm"],
    nearMRT: "中山站", nearMRTVi: "Ga Zhongshan", walkMinutes: 6,
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=85",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=900&q=85",
      "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=900&q=85",
    ],
    agentName: "張志豪", agentPhone: "0956-789-012", agentLine: "zhihao_home",
    isNew: true, isFeatured: false, views: 89, postedAt: "2025-05-24T11:00:00Z",
    lat: 25.0521, lng: 121.5237,
    descriptionZh: "中山區林森商圈附近，生活機能極佳。全新裝潢，質感家具，拎包即入住。步行6分鐘到中山捷運站，附近有多家餐廳、咖啡廳及便利商店。",
    descriptionVi: "Gần khu thương mại Linsen, tiện ích đầy đủ. Nội thất hoàn toàn mới, vào ở ngay. Đi bộ 6 phút đến ga MRT Zhongshan. Xung quanh nhiều nhà hàng, cà phê và cửa hàng tiện lợi.",
  },
]

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id)
}

export function formatPrice(p: Property, lang: "zh" | "vi"): string {
  if (p.listingType === "rent") {
    return lang === "zh"
      ? `NT$${p.price.toLocaleString()}/月`
      : `NT$${p.price.toLocaleString()}/tháng`
  }
  return lang === "zh"
    ? `${p.price.toLocaleString()}萬`
    : `${p.price.toLocaleString()} vạn NTD`
}

export function pingToM2(ping: number): number {
  return Math.round(ping * 3.306)
}
