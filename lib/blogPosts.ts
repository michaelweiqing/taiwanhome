// lib/blogPosts.ts — Nội dung blog tĩnh, tối ưu SEO cho từ khóa dài (long-tail)
// hướng tới cộng đồng người Việt tại Đài Loan

export interface BlogSection {
  heading_vi: string
  paragraphs_vi: string[]
}

export interface BlogPost {
  slug: string
  title_vi: string
  title_zh: string
  description_vi: string
  publishedAt: string // ISO date
  category: "thue-nha" | "mua-nha" | "kien-thuc"
  sections: BlogSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kinh-nghiem-thue-nha-dai-loan-cho-nguoi-viet",
    title_vi: "Kinh nghiệm thuê nhà ở Đài Loan cho người Việt",
    title_zh: "越南人在台灣租屋經驗分享",
    description_vi:
      "Hướng dẫn chi tiết cách thuê nhà tại Đài Loan cho người Việt: giấy tờ cần chuẩn bị, tiền cọc, hợp đồng thuê nhà, và cách tránh rủi ro thường gặp.",
    publishedAt: "2026-07-20",
    category: "thue-nha",
    sections: [
      {
        heading_vi: "Giấy tờ cần chuẩn bị trước khi thuê nhà",
        paragraphs_vi: [
          "Khi thuê nhà tại Đài Loan, người thuê thường cần xuất trình thẻ cư trú (居留證/ARC) hoặc hộ chiếu còn hiệu lực, đôi khi chủ nhà yêu cầu thêm thông tin công việc hoặc người bảo lãnh nếu là người mới sang. Nếu thuê qua công ty môi giới lao động, một số công ty sẽ hỗ trợ đứng tên hợp đồng thuê nhà thay công nhân — nên hỏi rõ ai là người đứng tên chính trên hợp đồng để tránh tranh chấp về sau.",
        ],
      },
      {
        heading_vi: "Tiền cọc, tiền thuê và phí quản lý",
        paragraphs_vi: [
          "Thông lệ phổ biến tại Đài Loan là đặt cọc 2 tháng tiền thuê (押金), thanh toán tiền thuê hàng tháng vào đầu hoặc cuối tháng tùy thỏa thuận với chủ nhà. Một số chung cư có phí quản lý (管理費) riêng, không bao gồm trong tiền thuê — cần hỏi rõ trước khi ký hợp đồng để tránh bất ngờ về chi phí. Tiền điện nước có thể tính riêng theo đồng hồ hoặc gộp vào tiền thuê, tùy từng chủ nhà.",
        ],
      },
      {
        heading_vi: "Những điều cần lưu ý trong hợp đồng thuê nhà",
        paragraphs_vi: [
          "Hợp đồng thuê nhà tại Đài Loan (租賃契約) nên ghi rõ: thời hạn thuê, số tiền cọc, ngày thanh toán, ai chịu trách nhiệm sửa chữa khi hỏng hóc, và điều kiện chấm dứt hợp đồng trước hạn. Người thuê nên đọc kỹ hoặc nhờ người biết tiếng Trung hỗ trợ trước khi ký, đặc biệt các điều khoản về hoàn trả tiền cọc khi trả nhà.",
        ],
      },
      {
        heading_vi: "Kinh nghiệm tìm nhà gần chỗ làm và khu công nghiệp",
        paragraphs_vi: [
          "Với người Việt làm việc tại các khu công nghiệp lớn (Đào Viên, Tân Trúc, Đài Trung, Đài Nam...), nên ưu tiên tìm nhà trong bán kính đi xe máy 15-20 phút để tiết kiệm thời gian và chi phí di chuyển. 8386找房網 hiển thị rõ khoảng cách tới ga MRT/HSR gần nhất trong từng tin đăng, giúp người thuê ước lượng thời gian di chuyển trước khi liên hệ xem nhà.",
        ],
      },
    ],
  },

  {
    slug: "thu-tuc-mua-nha-dai-loan-nguoi-nuoc-ngoai",
    title_vi: "Thủ tục mua nhà tại Đài Loan cho người nước ngoài",
    title_zh: "外國人在台灣購屋流程",
    description_vi:
      "Người nước ngoài có được mua nhà tại Đài Loan không? Các bước mua nhà, chi phí phát sinh, và lưu ý về vay ngân hàng cho người Việt tại Đài Loan.",
    publishedAt: "2026-07-22",
    category: "mua-nha",
    sections: [
      {
        heading_vi: "Người nước ngoài có được đứng tên mua nhà tại Đài Loan không?",
        paragraphs_vi: [
          "Về nguyên tắc, người nước ngoài (bao gồm người Việt) được phép mua và đứng tên sở hữu bất động sản tại Đài Loan theo nguyên tắc có đi có lại (reciprocity) giữa Đài Loan và quốc gia của người mua, với một số loại đất/khu vực có hạn chế riêng (ví dụ đất nông nghiệp, khu vực an ninh quốc phòng). Trước khi tiến hành, nên hỏi trực tiếp văn phòng địa chính (地政事務所) hoặc luật sư/môi giới có kinh nghiệm để xác nhận trường hợp cụ thể của mình.",
        ],
      },
      {
        heading_vi: "Các bước cơ bản khi mua nhà tại Đài Loan",
        paragraphs_vi: [
          "Quy trình mua nhà thông thường gồm: (1) xem nhà và thương lượng giá, (2) đặt cọc giữ chỗ (斡旋金/要約書), (3) ký hợp đồng mua bán chính thức và thanh toán các đợt tiền theo thỏa thuận, (4) công chứng và làm thủ tục chuyển quyền sở hữu (過戶) tại văn phòng địa chính, (5) nhận nhà và bàn giao. Toàn bộ quá trình thường mất từ 1-3 tháng tùy vào việc có vay ngân hàng hay không.",
        ],
      },
      {
        heading_vi: "Chi phí phát sinh khi mua nhà",
        paragraphs_vi: [
          "Ngoài giá nhà, người mua cần dự trù thêm: thuế trước bạ (契稅), phí công chứng, phí môi giới (nếu qua công ty môi giới, thường 1-2% giá trị nhà), và phí đăng ký quyền sở hữu. Nên hỏi rõ agent/môi giới về tổng chi phí phát sinh dự kiến trước khi quyết định đặt cọc.",
        ],
      },
      {
        heading_vi: "Vay ngân hàng mua nhà có dễ không?",
        paragraphs_vi: [
          "Người nước ngoài có thẻ cư trú dài hạn và thu nhập ổn định tại Đài Loan vẫn có thể vay mua nhà tại một số ngân hàng, tuy điều kiện và tỷ lệ vay thường khắt khe hơn so với công dân Đài Loan. Nên chuẩn bị sẵn giấy tờ chứng minh thu nhập, hợp đồng lao động, và lịch sử cư trú để ngân hàng thẩm định hồ sơ nhanh hơn.",
        ],
      },
    ],
  },

  {
    slug: "kinh-nghiem-thue-nha-dai-trung",
    title_vi: "Kinh nghiệm thuê nhà tại Đài Trung cho người Việt",
    title_zh: "越南人在台中租屋經驗",
    description_vi:
      "Nên thuê nhà khu nào ở Đài Trung? Giá thuê tham khảo, khoảng cách tới khu công nghiệp, và kinh nghiệm chọn nhà phù hợp cho người Việt tại Đài Trung.",
    publishedAt: "2026-07-24",
    category: "thue-nha",
    sections: [
      {
        heading_vi: "Nên thuê nhà ở khu nào tại Đài Trung?",
        paragraphs_vi: [
          "Đài Trung có 29 quận/khu, mỗi khu có đặc điểm riêng. Bắc Đồn và Tây Đồn gần trung tâm thương mại, tiện ích đầy đủ nhưng giá thuê cao hơn. Nam Đồn gần các trường đại học, phù hợp du học sinh. Thái Bình, Đại Lý, Ô Nhật là khu vực có nhiều nhà máy, giá thuê mềm hơn đáng kể, phù hợp công nhân muốn tiết kiệm chi phí sinh hoạt.",
        ],
      },
      {
        heading_vi: "Giá thuê tham khảo theo khu vực",
        paragraphs_vi: [
          "Phòng trọ đơn tại khu trung tâm (Bắc Đồn, Tây Đồn) thường dao động 6.000-9.000 Đài tệ/tháng, trong khi các khu ngoại ô như Thái Bình, Đại Lý có thể chỉ 4.000-6.000 Đài tệ/tháng cho diện tích tương đương. Nhà nguyên căn hoặc chung cư 2-3 phòng ngủ dao động rộng hơn tùy khu vực và tuổi nhà, nên tham khảo trực tiếp các tin đăng trên 8386找房網 để có số liệu cập nhật theo thời điểm.",
        ],
      },
      {
        heading_vi: "Di chuyển tới các khu công nghiệp lớn",
        paragraphs_vi: [
          "Nhiều khu công nghiệp tại Đài Trung tập trung ở khu vực Đại Lý, Ô Nhật, Thanh Thủy — nếu làm việc tại đây, nên ưu tiên thuê nhà trong bán kính 10-15 phút xe máy để tiết kiệm thời gian di chuyển, đặc biệt vào mùa mưa hoặc khi làm ca đêm.",
        ],
      },
      {
        heading_vi: "Lưu ý khi xem nhà thực tế",
        paragraphs_vi: [
          "Nên xem nhà trực tiếp trước khi đặt cọc, kiểm tra kỹ hệ thống điện nước, tình trạng thấm dột (đặc biệt với nhà cũ), và xác nhận rõ những đồ nội thất có sẵn (máy lạnh, máy giặt, tủ lạnh) có tính vào tiền thuê hay không. 8386找房網 có agent người Việt trực tiếp phụ trách khu vực Đài Trung, hỗ trợ đi xem nhà và phiên dịch khi cần.",
        ],
      },
    ],
  },

  {
    slug: "phan-biet-loai-hinh-nha-o-dai-loan",
    title_vi: "Phân biệt các loại hình nhà ở tại Đài Loan",
    title_zh: "台灣房屋類型介紹",
    description_vi:
      "Chung cư thang bộ, chung cư thang máy, nhà phố, biệt thự tại Đài Loan khác nhau thế nào? Cách chọn loại nhà phù hợp với nhu cầu của người Việt.",
    publishedAt: "2026-07-26",
    category: "kien-thuc",
    sections: [
      {
        heading_vi: "Chung cư thang bộ (公寓) và chung cư thang máy (電梯大樓)",
        paragraphs_vi: [
          "Chung cư thang bộ (公寓) thường là các tòa nhà cũ 4-5 tầng không có thang máy, giá thuê/mua mềm hơn nhưng bất tiện nếu ở tầng cao. Chung cư thang máy (電梯大樓) là các tòa nhà cao tầng hiện đại hơn, có thang máy, bảo vệ, đôi khi có phòng gym/hồ bơi chung — giá thuê/mua cao hơn tương ứng với tiện ích.",
        ],
      },
      {
        heading_vi: "Nhà phố / nhà nguyên căn (透天厝)",
        paragraphs_vi: [
          "透天厝 là dạng nhà phố nhiều tầng, sở hữu toàn bộ đất và nhà (không chung tường/hành lang với ai), phổ biến ở vùng ngoại ô và các huyện như Chương Hóa, Đài Trung. Phù hợp gia đình đông người, cần không gian sân trước/sân sau, hoặc muốn kết hợp ở và kinh doanh (tầng trệt làm cửa hàng).",
        ],
      },
      {
        heading_vi: "Biệt thự (別墅)",
        paragraphs_vi: [
          "Biệt thự tại Đài Loan thường có diện tích đất lớn hơn nhà phố thông thường, thiết kế kiến trúc riêng biệt, giá cao hơn đáng kể. Phù hợp với gia đình có ngân sách cao, ưu tiên không gian sống riêng tư và sân vườn rộng rãi.",
        ],
      },
      {
        heading_vi: "Cách chọn loại nhà phù hợp",
        paragraphs_vi: [
          "Người độc thân hoặc cặp đôi mới sang nên ưu tiên phòng trọ/chung cư nhỏ gần chỗ làm để tiết kiệm chi phí. Gia đình có con nhỏ nên ưu tiên chung cư thang máy hoặc nhà phố gần trường học, có chỗ đậu xe. Nếu có ý định kinh doanh nhỏ (quán ăn, tạp hóa), nhà phố (透天厝) với tầng trệt mặt tiền là lựa chọn linh hoạt nhất.",
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}

export function getBlogPostsSorted(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}
