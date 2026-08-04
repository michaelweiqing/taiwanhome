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
    title_vi: "Người Việt mua nhà tại Đài Loan: Điều kiện và thủ tục cần biết",
    title_zh: "越南人在台灣購屋的條件與流程",
    description_vi:
      "Người Việt có được mua nhà tại Đài Loan không? Giải thích nguyên tắc bình đẳng tương hỗ, trường hợp đã nhập tịch, các bước mua nhà và chi phí phát sinh.",
    publishedAt: "2026-07-22",
    category: "mua-nha",
    sections: [
      {
        heading_vi: "Người Việt có được đứng tên mua nhà tại Đài Loan không?",
        paragraphs_vi: [
          "Đây là điều quan trọng nhất cần biết trước khi tính đến chuyện mua nhà: theo nguyên tắc \"bình đẳng tương hỗ\" (Điều 18 Luật Đất đai Đài Loan), một quốc gia chỉ được mua bất động sản tại Đài Loan nếu Đài Loan cũng được mua đất tại quốc gia đó. Việt Nam hiện KHÔNG nằm trong danh sách quốc gia bình đẳng tương hỗ với Đài Loan (cùng nhóm với Indonesia, Myanmar, Ma Cao) — do đó người mang quốc tịch Việt Nam (chưa nhập tịch Đài Loan) về nguyên tắc không được phép đứng tên mua bất động sản tại Đài Loan.",
          "Trường hợp phổ biến nhất mà người Việt vẫn mua được nhà tại Đài Loan là khi đã nhập tịch Đài Loan — thường qua diện kết hôn với người Đài Loan và hoàn tất thủ tục nhập quốc tịch. Khi đó, về mặt pháp lý người đó là công dân Đài Loan và mua bán nhà đất hoàn toàn bình thường như người bản xứ, không còn bị giới hạn bởi nguyên tắc tương hỗ. Nếu chưa nhập tịch, một số gia đình lựa chọn đứng tên nhà dưới tên người vợ/chồng Đài Loan — cách này cần tư vấn kỹ với luật sư hoặc chuyên viên địa chính để đảm bảo quyền lợi rõ ràng cho cả hai bên trước khi thực hiện.",
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
  {
    slug: "toan-canh-thi-truong-bat-dong-san-dai-loan",
    title_vi: "Toàn cảnh thị trường bất động sản Đài Loan 2026 theo từng thành phố",
    title_zh: "2026台灣各城市房地產市場概況",
    description_vi:
      "Tổng quan thị trường bất động sản Đài Loan: mặt bằng giá, khu vực nổi bật tại Đài Bắc, Tân Bắc, Đào Viên, Tân Trúc, Đài Trung, Chương Hóa, Đài Nam, Cao Hùng.",
    publishedAt: "2026-07-28",
    category: "kien-thuc",
    sections: [
      {
        heading_vi: "Tổng quan thị trường bất động sản Đài Loan hiện nay",
        paragraphs_vi: [
          "Thị trường bất động sản Đài Loan phân hóa rõ rệt theo khu vực: các thành phố lớn phía Bắc (Đài Bắc, Tân Bắc) có giá nhà cao nhất do tập trung kinh tế - hành chính, trong khi các thành phố miền Trung và Nam (Đài Trung, Đài Nam, Cao Hùng) có mặt bằng giá dễ tiếp cận hơn. Người Việt tại Đài Loan, dù thuê hay mua, nên nắm được đặc điểm từng khu vực để đưa ra lựa chọn phù hợp với công việc và ngân sách của mình.",
        ],
      },
      {
        heading_vi: "Đài Bắc & Tân Bắc — trung tâm kinh tế, giá cao nhất cả nước",
        paragraphs_vi: [
          "Đài Bắc là thủ đô và trung tâm tài chính, giá nhà thuộc nhóm cao nhất châu Á, hệ thống MRT dày đặc thuận tiện di chuyển. Tân Bắc bao quanh Đài Bắc, giá mềm hơn 20-30% trong khi vẫn kết nối MRT vào trung tâm, là lựa chọn phổ biến của người đi làm tại Đài Bắc nhưng muốn tiết kiệm chi phí nhà ở.",
        ],
      },
      {
        heading_vi: "Đào Viên & Tân Trúc — trung tâm công nghiệp và công nghệ cao",
        paragraphs_vi: [
          "Đào Viên có sân bay quốc tế và nhiều khu công nghiệp lớn, tập trung đông lao động nước ngoài trong đó có người Việt, giá nhà ở mức trung bình. Tân Trúc là trung tâm công nghệ bán dẫn của Đài Loan (Hsinchu Science Park), thu nhập bình quân khu vực cao nên giá nhà cũng cao tương ứng, phù hợp với kỹ sư và chuyên gia có thu nhập ổn định.",
        ],
      },
      {
        heading_vi: "Đài Trung & Chương Hóa — khu vực phát triển nhanh, giá vẫn hợp lý",
        paragraphs_vi: [
          "Đài Trung là thành phố lớn thứ ba Đài Loan, tốc độ đô thị hóa nhanh nhưng giá nhà vẫn thấp hơn đáng kể so với Đài Bắc, được nhiều người Việt định cư lâu dài lựa chọn. Chương Hóa giáp Đài Trung, có giá nhà đất mềm hơn rõ rệt nhờ đặc điểm huyện nông nghiệp - công nghiệp, phù hợp với người muốn tiết kiệm ngân sách khi mua nhà lần đầu.",
        ],
      },
      {
        heading_vi: "Đài Nam & Cao Hùng — chi phí sinh hoạt thấp nhất trong nhóm thành phố lớn",
        paragraphs_vi: [
          "Đài Nam là cố đô miền Nam, chi phí sinh hoạt và giá nhà thuộc nhóm thấp nhất trong các thành phố lớn. Cao Hùng là thành phố cảng công nghiệp nặng, cũng có mặt bằng giá nhà dễ tiếp cận, phù hợp với công nhân và gia đình ưu tiên tiết kiệm chi phí sinh hoạt hơn là gần trung tâm kinh tế.",
        ],
      },
      {
        heading_vi: "Xu hướng giá nhà những năm gần đây",
        paragraphs_vi: [
          "Nhìn chung, giá nhà tại các thành phố lớn của Đài Loan có xu hướng tăng đều trong nhiều năm qua, đặc biệt tại khu vực gần các tuyến MRT mới mở hoặc khu công nghệ cao đang phát triển. Người có kế hoạch mua nhà nên theo dõi sát các tin đăng thực tế theo từng khu vực quan tâm — 8386找房網 cập nhật tin đăng mới mỗi ngày tại cả 8 thành phố lớn để người dùng có cái nhìn thị trường sát với thực tế nhất.",
        ],
      },
    ],
  },
  {
    slug: "kiem-tra-dien-nuoc-mua-nha-cu-sua-nha",
    title_vi: "Kiểm tra hệ thống điện nước khi mua nhà cũ hoặc sửa nhà tại Đài Loan",
    title_zh: "台灣買中古屋或裝修時的水電檢查重點",
    description_vi:
      "Những điểm cần kiểm tra về đường điện, đường nước khi mua nhà cũ hoặc sửa chữa nhà tại Đài Loan, tránh phát sinh chi phí sửa chữa lớn sau khi dọn vào ở.",
    publishedAt: "2026-07-30",
    category: "kien-thuc",
    sections: [
      {
        heading_vi: "Vì sao cần kiểm tra kỹ hệ thống điện nước trước khi mua/sửa nhà",
        paragraphs_vi: [
          "Nhà cũ tại Đài Loan, đặc biệt các căn xây trước năm 2000, thường dùng dây điện và đường ống nước theo tiêu chuẩn cũ, có thể không đáp ứng đủ công suất cho các thiết bị hiện đại (máy lạnh, máy giặt, bình nóng lạnh dùng cùng lúc) hoặc đã xuống cấp gây rò rỉ. Kiểm tra kỹ trước khi đặt cọc giúp tránh phát sinh chi phí sửa chữa lớn sau khi đã dọn vào ở.",
        ],
      },
      {
        heading_vi: "Dấu hiệu cảnh báo hệ thống điện có vấn đề",
        paragraphs_vi: [
          "Một số dấu hiệu cần lưu ý: cầu dao (電箱) cũ, số ampe thấp không đủ tải cho nhiều thiết bị điện cùng lúc; dây điện lộ ra ngoài, không đi trong ống bảo vệ; ổ cắm bị cháy sém hoặc lỏng lẻo; đèn nhấp nháy không rõ nguyên nhân. Nếu nhà đã trên 20 năm tuổi, nên yêu cầu chủ nhà cho xem hồ sơ sửa chữa điện gần nhất, hoặc thuê thợ điện kiểm tra tổng thể trước khi ký hợp đồng mua bán.",
        ],
      },
      {
        heading_vi: "Những điều cần kiểm tra với đường ống nước",
        paragraphs_vi: [
          "Kiểm tra áp lực nước tại các vòi, xem có hiện tượng nước chảy yếu bất thường (dấu hiệu ống bị đóng cặn hoặc rò rỉ ngầm) hay không. Quan sát các vết ố vàng, ẩm mốc trên trần và tường — đây là dấu hiệu rõ ràng nhất của rò rỉ nước ống ngầm trong tường hoặc trần nhà, chi phí sửa chữa thường cao vì phải đục tường. Nhà vệ sinh và nhà bếp là hai khu vực dễ phát sinh vấn đề nhất, nên kiểm tra kỹ độ kín nước quanh bồn rửa, bồn cầu.",
        ],
      },
      {
        heading_vi: "Chi phí sửa chữa điện nước tham khảo",
        paragraphs_vi: [
          "Thay mới toàn bộ hệ thống dây điện cho một căn hộ trung bình có thể tốn từ vài chục nghìn đến hơn 100.000 Đài tệ tùy diện tích và mức độ sửa chữa. Sửa ống nước rò rỉ đơn giản thường rẻ hơn, nhưng nếu phải đục tường tìm điểm rò rỉ, chi phí có thể tăng đáng kể. Nên đưa các khoản chi phí sửa chữa dự kiến vào cân nhắc khi thương lượng giá mua nhà.",
        ],
      },
      {
        heading_vi: "Lưu ý khi thuê thợ điện nước tại Đài Loan",
        paragraphs_vi: [
          "Nên chọn thợ có giấy phép hành nghề (證照), yêu cầu báo giá rõ ràng trước khi thi công, và giữ lại hóa đơn/biên nhận để làm bằng chứng bảo hành nếu có vấn đề phát sinh sau này. Người Việt chưa rành tiếng Trung có thể nhờ agent hoặc người quen phiên dịch khi trao đổi với thợ để tránh hiểu lầm về phạm vi công việc và chi phí.",
        ],
      },
    ],
  },
  {
    slug: "phong-thuy-nha-dat-dai-loan",
    title_vi: "Phong thủy nhà đất tại Đài Loan: Hướng nhà, hướng cửa, hướng ban công",
    title_zh: "台灣房屋風水：座向、大門方位與陽台朝向",
    description_vi:
      "Người Đài Loan coi trọng phong thủy khi mua nhà như thế nào? Giải thích hướng nhà, hướng đất, hướng cửa chính, hướng cửa sổ, hướng ban công theo quan niệm phổ biến tại Đài Loan.",
    publishedAt: "2026-08-01",
    category: "kien-thuc",
    sections: [
      {
        heading_vi: "Vì sao người Đài Loan coi trọng phong thủy khi mua nhà",
        paragraphs_vi: [
          "Phong thủy (風水) là yếu tố văn hóa truyền thống có ảnh hưởng lớn đến quyết định mua nhà của người Đài Loan, tương tự văn hóa Việt Nam. Nhiều người xem phong thủy tốt như một yếu tố cộng thêm về tâm lý an tâm và giá trị bán lại sau này, bên cạnh các tiêu chí thực tế như vị trí, giá cả, diện tích. Người Việt mua/thuê nhà tại Đài Loan, dù không tin phong thủy, cũng nên biết các khái niệm cơ bản vì chúng thường xuất hiện trong tin đăng và lời tư vấn của môi giới địa phương.",
        ],
      },
      {
        heading_vi: "Hướng nhà và hướng đất (座向)",
        paragraphs_vi: [
          "Hướng nhà tại Đài Loan thường được xác định theo hướng của mặt tiền chính (cửa chính) so với các hướng la bàn. Theo quan niệm phổ biến, nhà hướng Nam hoặc Đông Nam được xem là tốt nhất vì đón nhiều ánh sáng tự nhiên, tránh nắng gắt buổi chiều từ hướng Tây (曬西曬 — hiện tượng nhà quá nóng vào buổi chiều do hứng nắng Tây trực tiếp, khiến tiền điện máy lạnh tăng cao). Đây cũng là lý do thực tế khiến nhà hướng Tây thường có giá thấp hơn nhà cùng khu vực hướng khác.",
        ],
      },
      {
        heading_vi: "Hướng cửa chính",
        paragraphs_vi: [
          "Cửa chính được xem là nơi \"đón khí\" vào nhà theo quan niệm phong thủy, nên nhiều người tránh cửa chính đối diện trực tiếp cầu thang, thang máy, hoặc đường đâm thẳng vào nhà (路沖 — con đường chĩa thẳng vào cửa nhà). Cửa chính cũng thường được khuyên không đối diện trực tiếp với cửa nhà vệ sinh hoặc cửa phòng ngủ chính để tránh \"khí xấu\" theo quan niệm truyền thống.",
        ],
      },
      {
        heading_vi: "Hướng cửa sổ và hướng ban công",
        paragraphs_vi: [
          "Cửa sổ và ban công hướng Nam hoặc Đông Nam thường được ưu tiên vì đón gió mát và ánh sáng dịu vào buổi sáng. Ban công hướng ra không gian mở (công viên, sân rộng) được xem là tốt hơn ban công đối diện trực tiếp một tòa nhà khác ở khoảng cách quá gần (đối diện tường, gọi là \"thiên trảm sát\" trong một số quan niệm phong thủy truyền thống). Với căn hộ chung cư cao tầng, hướng ban công cũng ảnh hưởng đến lượng ánh sáng tự nhiên nhận được trong ngày.",
        ],
      },
      {
        heading_vi: "Hướng tòa nhà và các lưu ý khác",
        paragraphs_vi: [
          "Ngoài hướng nhà, một số yếu tố khác cũng thường được người mua nhà tại Đài Loan cân nhắc: tránh nhà gần nghĩa trang, đền miếu lớn, hoặc nằm ở góc cụt cuối hẻm (không có lối thoát thứ hai). Tuy nhiên, đây đều là yếu tố tham khảo theo quan niệm văn hóa — người mua nên cân bằng giữa yếu tố phong thủy và các tiêu chí thực tế như giá cả, vị trí, chất lượng xây dựng khi ra quyết định cuối cùng.",
        ],
      },
    ],
  },
  {
    slug: "tu-dien-thuat-ngu-bat-dong-san-dai-loan",
    title_vi: "Từ điển thuật ngữ bất động sản Đài Loan cho người Việt",
    title_zh: "台灣不動產常用術語中越對照",
    description_vi:
      "Giải thích các thuật ngữ, từ ngữ chuyên dụng thường gặp khi mua bán, cho thuê nhà đất tại Đài Loan — từ hợp đồng, diện tích, giá cả đến loại hình nhà ở.",
    publishedAt: "2026-08-03",
    category: "kien-thuc",
    sections: [
      {
        heading_vi: "Thuật ngữ liên quan tới hợp đồng và giao dịch",
        paragraphs_vi: [
          "押金 (áp kim) — Tiền cọc, thường 1-2 tháng tiền thuê đối với thuê nhà.",
          "租賃契約 (tô lãm khế ước) — Hợp đồng thuê nhà, quy định quyền và nghĩa vụ giữa chủ nhà và người thuê.",
          "斡旋金 / 要約書 (oát toàn kim) — Tiền đặt cọc giữ chỗ khi mua nhà, nộp trước khi ký hợp đồng mua bán chính thức để thể hiện thiện chí mua.",
          "過戶 (quá hộ) — Thủ tục chuyển quyền sở hữu bất động sản sang tên người mua tại văn phòng địa chính.",
          "仲介費 (trọng giới phí) — Phí môi giới, thường 1-2% giá trị nhà khi mua bán, hoặc nửa tháng đến 1 tháng tiền thuê khi thuê nhà qua môi giới.",
        ],
      },
      {
        heading_vi: "Thuật ngữ liên quan tới diện tích và giá cả",
        paragraphs_vi: [
          "坪 (bình/ping) — Đơn vị đo diện tích phổ biến tại Đài Loan, 1 bình ≈ 3,3 mét vuông.",
          "權狀坪數 (quyền trạng bình số) — Diện tích ghi trên giấy chứng nhận quyền sở hữu, bao gồm cả diện tích sử dụng riêng và diện tích công cộng được phân bổ (hành lang, thang máy...).",
          "公設比 (công thiết tỷ) — Tỷ lệ diện tích công cộng trên tổng diện tích quyền trạng; tỷ lệ này càng cao thì diện tích sử dụng thực tế của căn hộ càng thấp so với diện tích ghi trên giấy tờ.",
          "每坪單價 (mỗi bình đơn giá) — Giá nhà tính theo mỗi bình, thường dùng để so sánh giá giữa các căn hộ có diện tích khác nhau.",
          "管理費 (quản lý phí) — Phí quản lý chung cư hàng tháng, không bao gồm trong tiền thuê hoặc giá mua nhà, chi trả cho bảo vệ, vệ sinh, bảo trì khu vực chung.",
        ],
      },
      {
        heading_vi: "Thuật ngữ liên quan tới loại hình nhà ở",
        paragraphs_vi: [
          "公寓 (công dụ) — Chung cư thang bộ, thường là nhà cũ 4-5 tầng không có thang máy.",
          "電梯大樓 (điện thê đại lâu) — Chung cư thang máy, tòa nhà cao tầng hiện đại có thang máy.",
          "透天厝 (thấu thiên thố) — Nhà phố/nhà nguyên căn nhiều tầng, sở hữu toàn bộ đất và nhà, không chung tường với nhà bên cạnh.",
          "華廈 (hoa hạ) — Loại chung cư quy mô nhỏ, thường dưới 12 tầng, thấp hơn 電梯大樓 cỡ lớn nhưng vẫn có thang máy.",
          "雅房 / 套房 (nhã phòng / sáo phòng) — 雅房 là phòng thuê dùng chung nhà vệ sinh/bếp với người khác; 套房 là phòng có khép kín nhà vệ sinh riêng.",
        ],
      },
      {
        heading_vi: "Thuật ngữ liên quan tới thủ tục pháp lý",
        paragraphs_vi: [
          "地政事務所 (địa chính sự vụ sở) — Văn phòng địa chính, nơi thực hiện thủ tục đăng ký, chuyển nhượng quyền sở hữu bất động sản.",
          "所有權狀 (sở hữu quyền trạng) — Giấy chứng nhận quyền sở hữu bất động sản, tương đương sổ đỏ/sổ hồng tại Việt Nam.",
          "契稅 (khế thuế) — Thuế trước bạ, người mua nhà phải nộp khi làm thủ tục chuyển quyền sở hữu.",
          "房屋稅 / 地價稅 (phòng ốc thuế / địa giá thuế) — Thuế nhà và thuế đất hàng năm mà chủ sở hữu bất động sản phải nộp.",
          "平等互惠原則 (bình đẳng hỗ huệ nguyên tắc) — Nguyên tắc quyết định quốc gia nào được phép mua bất động sản tại Đài Loan, dựa trên việc Đài Loan có được mua đất tại quốc gia đó hay không.",
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
