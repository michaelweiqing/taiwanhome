// lib/seoLandingPages.ts — Cấu hình nội dung cho các trang SEO landing page
// tĩnh theo từ khóa (VD: /thue-nha-dai-trung, /mua-nha-dai-loan...)

export interface SeoLandingPage {
  slug: string
  type: "rent" | "buy"
  city?: string          // tên tiếng Trung để query Supabase, undefined = toàn quốc
  cityViLabel: string
  cityZhLabel: string
  title_vi: string
  title_zh: string
  h1_vi: string
  h1_zh: string
  metaDescription_vi: string
  intro_vi: string
  intro_zh: string
}

export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    slug: "thue-nha-dai-loan",
    type: "rent",
    city: undefined,
    cityViLabel: "Đài Loan",
    cityZhLabel: "台灣",
    title_vi: "Thuê Nhà Đài Loan - Nhà Cho Thuê Giá Tốt Toàn Quốc | 8386找房網",
    title_zh: "台灣租屋 - 全台出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Đài Loan cho người Việt",
    h1_zh: "台灣租屋資訊",
    metaDescription_vi:
      "Tìm nhà cho thuê tại Đài Loan song ngữ Trung-Việt: phòng trọ, chung cư, nhà nguyên căn tại Đài Bắc, Tân Bắc, Đào Viên, Tân Trúc, Đài Trung, Chương Hóa, Đài Nam, Cao Hùng. Liên hệ trực tiếp chủ nhà qua LINE, không qua môi giới.",
    intro_vi:
      "8386找房網 là kênh tìm nhà cho thuê song ngữ Trung-Việt dành riêng cho cộng đồng người Việt đang sinh sống, lao động và học tập tại Đài Loan. Chúng tôi tổng hợp tin cho thuê từ 8 thành phố lớn: Đài Bắc, Tân Bắc, Đào Viên, Tân Trúc, Đài Trung, Chương Hóa, Đài Nam và Cao Hùng — bao gồm phòng trọ đơn, chung cư có thang máy, nhà nguyên căn gần khu công nghiệp. Mỗi tin đăng đều có mô tả song ngữ, giá thuê rõ ràng theo tháng, và số điện thoại/LINE liên hệ trực tiếp chủ nhà hoặc người đăng — không phát sinh phí môi giới ẩn.",
    intro_zh:
      "8386找房網提供全台租屋資訊，包含台北、新北、桃園、新竹、台中、彰化、台南、高雄等地區的套房、電梯大樓、透天厝出租物件，中越雙語呈現，方便在台工作生活的越南朋友快速找到合適的住處。",
  },
  {
    slug: "mua-nha-dai-loan",
    type: "buy",
    city: undefined,
    cityViLabel: "Đài Loan",
    cityZhLabel: "台灣",
    title_vi: "Mua Nhà Đài Loan - Bất Động Sản Bán Toàn Quốc | 8386找房網",
    title_zh: "台灣買房 - 全台售屋物件 | 8386找房網",
    h1_vi: "Mua nhà, mua bán bất động sản tại Đài Loan",
    h1_zh: "台灣售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Đài Loan: chung cư, nhà phố, biệt thự, đất, mặt bằng kinh doanh tại 8 thành phố lớn. Thông tin song ngữ Trung-Việt, giá theo 萬/坪, tư vấn thủ tục mua nhà cho người nước ngoài tại Đài Loan.",
    intro_vi:
      "Người Việt sinh sống lâu dài tại Đài Loan — đặc biệt là những ai đã kết hôn với người Đài và hoàn tất thủ tục nhập quốc tịch — ngày càng quan tâm đến việc mua nhà thay vì thuê dài hạn. Lưu ý quan trọng: theo nguyên tắc bình đẳng tương hỗ của Đài Loan, người mang quốc tịch Việt Nam (chưa nhập tịch Đài) hiện không nằm trong danh sách được phép đứng tên mua bất động sản; trường hợp phổ biến để sở hữu nhà hợp pháp là đã nhập tịch Đài Loan hoặc đứng tên qua vợ/chồng người Đài. 8386找房網 tổng hợp tin bán nhà từ khắp Đài Loan: chung cư thang máy, nhà phố (透天厝), biệt thự, đất nền và mặt bằng kinh doanh, kèm thông tin diện tích, giá mỗi bình (坪), tuổi nhà, và liên hệ trực tiếp môi giới hoặc chủ nhà.",
    intro_zh:
      "8386找房網彙整全台售屋資訊，包含公寓大廈、透天厝、別墅、土地及店面，中越雙語呈現物件詳細資訊與每坪單價，協助在台越南朋友了解購屋流程與物件選擇。",
  },

  {
    slug: "thue-nha-dai-trung",
    type: "rent",
    city: "台中市",
    cityViLabel: "Đài Trung",
    cityZhLabel: "台中市",
    title_vi: "Thuê Nhà Đài Trung - Phòng Trọ, Chung Cư Cho Thuê | 8386找房網",
    title_zh: "台中租屋 - 套房、電梯大樓出租 | 8386找房網",
    h1_vi: "Thuê nhà tại Đài Trung cho người Việt",
    h1_zh: "台中租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Đài Trung: phòng trọ, chung cư thang máy, nhà nguyên căn khu Bắc Đồn, Nam Đồn, Tây Đồn, Thái Bình, Đại Lý... Giá thuê theo tháng, liên hệ trực tiếp qua LINE 0903-379-666.",
    intro_vi:
      "Đài Trung là thành phố lớn thứ ba Đài Loan, quy tụ nhiều khu công nghiệp và trường đại học nên có đông đảo người Việt sinh sống — từ công nhân, du học sinh đến các gia đình đa văn hóa. Các khu vực được người Việt thuê nhà nhiều nhất gồm Bắc Đồn, Nam Đồn, Tây Đồn (gần khu công nghiệp và trung tâm thương mại), Thái Bình, Đại Lý (giá thuê mềm hơn, gần các nhà máy). 8386找房網 do chính người Việt vận hành, hiểu rõ nhu cầu thuê nhà ngắn hạn của công nhân lẫn nhu cầu ở lâu dài của gia đình, hỗ trợ tư vấn trực tiếp bằng tiếng Việt.",
    intro_zh:
      "台中市是台灣中部最大城市，工業區與大學林立，越南朋友承租需求集中在北屯、南屯、西屯、太平、大里等區域，8386找房網提供中越雙語物件資訊及在地仲介直接聯繫服務。",
  },
  {
    slug: "mua-nha-dai-trung",
    type: "buy",
    city: "台中市",
    cityViLabel: "Đài Trung",
    cityZhLabel: "台中市",
    title_vi: "Mua Nhà Đài Trung - Chung Cư, Nhà Phố, Biệt Thự | 8386找房網",
    title_zh: "台中買房 - 公寓、透天厝、別墅售屋 | 8386找房網",
    h1_vi: "Mua nhà tại Đài Trung",
    h1_zh: "台中售屋資訊",
    metaDescription_vi:
      "Mua nhà Đài Trung: chung cư thang máy, nhà phố, biệt thự tại Bắc Đồn, Tây Đồn, Nam Đồn, Thần Cương, Đàm Tử... Giá theo 萬/坪, tư vấn trực tiếp bằng tiếng Việt.",
    intro_vi:
      "Đài Trung có tốc độ phát triển đô thị nhanh, giá nhà vẫn hợp lý hơn Đài Bắc nên được nhiều người Việt định cư lâu dài lựa chọn để mua nhà an cư. Các khu vực đáng chú ý: Bắc Đồn, Tây Đồn (gần trung tâm, tiện ích đầy đủ), Nam Đồn (gần trường đại học), Thần Cương, Đàm Tử (nhà phố, biệt thự giá tốt, phù hợp gia đình có nhu cầu sân vườn, chỗ đậu xe rộng). 8386找房網 do agent người Việt trực tiếp phụ trách khu vực Đài Trung, hỗ trợ xem nhà, tư vấn thủ tục mua bán từ A-Z.",
    intro_zh:
      "台中市房價相對親民，越南朋友購屋熱門區域包含北屯、西屯、南屯、神岡、潭子等，8386找房網由專責台中地區的越南籍房仲提供全程中越雙語服務。",
  },

  {
    slug: "thue-nha-chuong-hoa",
    type: "rent",
    city: "彰化縣",
    cityViLabel: "Chương Hóa",
    cityZhLabel: "彰化縣",
    title_vi: "Thuê Nhà Chương Hóa - Nhà Cho Thuê Giá Rẻ | 8386找房網",
    title_zh: "彰化租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Chương Hóa cho người Việt",
    h1_zh: "彰化租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Chương Hóa: phòng trọ, chung cư, nhà nguyên căn khu Chương Hóa, Viên Lâm, Lộc Cảng, Hòa Mỹ. Giá thuê thấp hơn Đài Trung, gần khu công nghiệp, phù hợp công nhân và gia đình.",
    intro_vi:
      "Chương Hóa là huyện nông nghiệp - công nghiệp giáp Đài Trung, có giá thuê nhà mềm hơn đáng kể so với các thành phố lớn, rất phù hợp với công nhân và gia đình người Việt muốn tiết kiệm chi phí sinh hoạt. Khu vực trung tâm Chương Hóa, Viên Lâm, Lộc Cảng có nhiều phòng trọ và nhà nguyên căn gần các khu công nghiệp và nhà máy. 8386找房網 là kênh duy nhất chuyên sâu khu vực Chương Hóa dành cho người Việt, với agent trực tiếp phụ trách khu vực này.",
    intro_zh:
      "彰化縣鄰近台中，租金相對親民，適合在地工廠上班的越南朋友，熱門承租區域包含彰化市、員林、鹿港，8386找房網由在地房仲提供中越雙語物件資訊。",
  },
  {
    slug: "mua-nha-chuong-hoa",
    type: "buy",
    city: "彰化縣",
    cityViLabel: "Chương Hóa",
    cityZhLabel: "彰化縣",
    title_vi: "Mua Nhà Chương Hóa - Nhà Phố, Đất, Chung Cư | 8386找房網",
    title_zh: "彰化買房 - 透天厝、土地、公寓售屋 | 8386找房網",
    h1_vi: "Mua nhà tại Chương Hóa",
    h1_zh: "彰化售屋資訊",
    metaDescription_vi:
      "Mua nhà Chương Hóa: nhà phố, chung cư, đất nền tại Chương Hóa, Viên Lâm, Lộc Cảng. Tổng giá thấp, phù hợp mua nhà lần đầu. Tư vấn trực tiếp bằng tiếng Việt.",
    intro_vi:
      "So với Đài Trung hay các thành phố lớn, Chương Hóa có mặt bằng giá nhà đất thấp hơn rõ rệt, là lựa chọn tốt cho người mua nhà lần đầu hoặc gia đình muốn có nhà phố riêng kèm đất rộng với ngân sách vừa phải. 8386找房網 do chính agent phụ trách khu vực Đài Trung - Chương Hóa trực tiếp cập nhật tin đăng và tư vấn thủ tục mua bán, giúp người Việt an tâm hơn khi giao dịch bất động sản tại khu vực này.",
    intro_zh:
      "彰化縣房價親民，適合首購族，熱門售屋區域包含彰化市、員林、鹿港，8386找房網由專責台中彰化地區房仲提供全程協助。",
  },

  {
    slug: "thue-nha-dai-bac",
    type: "rent",
    city: "台北市",
    cityViLabel: "Đài Bắc",
    cityZhLabel: "台北市",
    title_vi: "Thuê Nhà Đài Bắc - Nhà Cho Thuê Trung Tâm Thủ Đô | 8386找房網",
    title_zh: "台北租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Đài Bắc cho người Việt",
    h1_zh: "台北租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Đài Bắc: phòng trọ, chung cư gần ga MRT tại Tín Nghĩa, Đại An, Trung Sơn, Vạn Hoa. Giá thuê theo tháng, thông tin song ngữ Trung-Việt.",
    intro_vi:
      "Đài Bắc là thủ đô và trung tâm kinh tế của Đài Loan, giá thuê nhà cao hơn các thành phố khác nhưng đổi lại hệ thống MRT thuận tiện, nhiều cơ hội việc làm cho người Việt làm văn phòng, nhà hàng, dịch vụ. Các khu vực thuê phổ biến: Vạn Hoa, Trung Sơn (giá mềm hơn, gần trung tâm), Tín Nghĩa, Đại An (cao cấp hơn). 8386找房網 tổng hợp tin cho thuê tại Đài Bắc với mô tả song ngữ rõ ràng.",
    intro_zh:
      "台北市為台灣首都及經濟中心，租金較高但生活機能完善，捷運便利，熱門承租區域包含萬華、中山、大安、信義。",
  },
  {
    slug: "mua-nha-dai-bac",
    type: "buy",
    city: "台北市",
    cityViLabel: "Đài Bắc",
    cityZhLabel: "台北市",
    title_vi: "Mua Nhà Đài Bắc - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "台北買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Đài Bắc",
    h1_zh: "台北售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Đài Bắc: chung cư, nhà phố tại Tín Nghĩa, Đại An, Trung Sơn, Nội Hồ. Giá theo 萬/坪, thông tin song ngữ Trung-Việt.",
    intro_vi:
      "Đài Bắc có giá bất động sản cao nhất Đài Loan do là trung tâm kinh tế - hành chính, phù hợp với nhà đầu tư hoặc gia đình có ngân sách cao muốn sở hữu nhà tại vị trí trung tâm, gần MRT và tiện ích đầy đủ. 8386找房網 cập nhật tin bán nhà tại Đài Bắc với thông tin diện tích, giá mỗi bình rõ ràng.",
    intro_zh:
      "台北市房價為全台最高，適合預算充足、重視精華地段與捷運機能的購屋族群，8386找房網提供台北售屋物件中越雙語資訊。",
  },

  {
    slug: "thue-nha-tan-bac",
    type: "rent",
    city: "新北市",
    cityViLabel: "Tân Bắc",
    cityZhLabel: "新北市",
    title_vi: "Thuê Nhà Tân Bắc - Nhà Cho Thuê Giá Tốt | 8386找房網",
    title_zh: "新北租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Tân Bắc cho người Việt",
    h1_zh: "新北租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Tân Bắc: phòng trọ, chung cư tại Bản Kiều, Tam Trọng, Trung Hòa, Tân Trang. Giá thuê mềm hơn Đài Bắc, gần khu công nghiệp và MRT.",
    intro_vi:
      "Tân Bắc là thành phố đông dân nhất Đài Loan, bao quanh Đài Bắc, có giá thuê nhà mềm hơn đáng kể trong khi vẫn kết nối MRT thuận tiện vào trung tâm. Nhiều người Việt làm việc tại Đài Bắc chọn thuê nhà ở Tân Bắc (Bản Kiều, Tam Trọng, Tân Trang, Trung Hòa) để tiết kiệm chi phí. 8386找房網 tổng hợp tin cho thuê tại Tân Bắc với mô tả song ngữ.",
    intro_zh:
      "新北市為全台人口最多城市，環繞台北，租金較台北親民，熱門承租區域包含板橋、三重、新莊、中和。",
  },
  {
    slug: "mua-nha-tan-bac",
    type: "buy",
    city: "新北市",
    cityViLabel: "Tân Bắc",
    cityZhLabel: "新北市",
    title_vi: "Mua Nhà Tân Bắc - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "新北買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Tân Bắc",
    h1_zh: "新北售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Tân Bắc: chung cư, nhà phố tại Bản Kiều, Tân Trang, Tam Hiệp. Giá hợp lý hơn Đài Bắc, kết nối MRT thuận tiện.",
    intro_vi:
      "Tân Bắc là lựa chọn phổ biến cho người muốn mua nhà gần Đài Bắc với ngân sách hợp lý hơn — khu Bản Kiều, Tân Trang có hạ tầng phát triển, kết nối MRT vào trung tâm Đài Bắc dễ dàng. 8386找房網 cập nhật tin bán nhà tại Tân Bắc với thông tin chi tiết diện tích và giá mỗi bình.",
    intro_zh:
      "新北市購屋預算較台北親民，熱門售屋區域包含板橋、新莊、三峽，捷運交通便利連結台北市區。",
  },

  {
    slug: "thue-nha-dao-vien",
    type: "rent",
    city: "桃園市",
    cityViLabel: "Đào Viên",
    cityZhLabel: "桃園市",
    title_vi: "Thuê Nhà Đào Viên - Nhà Cho Thuê Gần KCN | 8386找房網",
    title_zh: "桃園租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Đào Viên cho người Việt",
    h1_zh: "桃園租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Đào Viên: phòng trọ, nhà nguyên căn gần sân bay và khu công nghiệp tại Đào Viên, Trung Lịch, Bát Đức, Lô Trúc.",
    intro_vi:
      "Đào Viên có sân bay quốc tế và nhiều khu công nghiệp lớn, là nơi tập trung đông công nhân Việt Nam làm việc trong các nhà máy điện tử, cơ khí. Khu vực thuê nhà phổ biến: Đào Viên, Trung Lịch, Bát Đức, Lô Trúc — gần các khu công nghiệp, giá thuê hợp lý. 8386找房網 tổng hợp tin cho thuê tại Đào Viên phục vụ nhu cầu của công nhân và gia đình người Việt.",
    intro_zh:
      "桃園市擁有國際機場及多處工業區，越南籍勞工聚集，熱門租屋區域包含桃園、中壢、八德、蘆竹，鄰近工廠交通便利。",
  },
  {
    slug: "mua-nha-dao-vien",
    type: "buy",
    city: "桃園市",
    cityViLabel: "Đào Viên",
    cityZhLabel: "桃園市",
    title_vi: "Mua Nhà Đào Viên - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "桃園買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Đào Viên",
    h1_zh: "桃園售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Đào Viên: chung cư, nhà phố tại Trung Lịch, Bát Đức, Dương Mai. Gần khu công nghiệp, giá hợp lý cho gia đình.",
    intro_vi:
      "Đào Viên đang phát triển mạnh nhờ sân bay quốc tế và các khu công nghiệp công nghệ cao, giá nhà vẫn ở mức hợp lý so với Đài Bắc. Phù hợp với người Việt đã ổn định công việc lâu dài muốn mua nhà an cư gần nơi làm việc. 8386找房網 cập nhật tin bán nhà tại Đào Viên đầy đủ thông tin diện tích, giá mỗi bình.",
    intro_zh:
      "桃園市因機場與科技工業區發展迅速，房價相對合理，熱門售屋區域包含中壢、八德、楊梅，適合穩定就業的購屋族群。",
  },

  {
    slug: "thue-nha-tan-truc",
    type: "rent",
    city: "新竹市",
    cityViLabel: "Tân Trúc",
    cityZhLabel: "新竹市",
    title_vi: "Thuê Nhà Tân Trúc - Nhà Cho Thuê Gần Khu Công Nghệ | 8386找房網",
    title_zh: "新竹租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Tân Trúc cho người Việt",
    h1_zh: "新竹租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Tân Trúc: phòng trọ, chung cư gần khu công nghệ cao Hsinchu tại Khu Đông, Khu Bắc, Hương Sơn.",
    intro_vi:
      "Tân Trúc nổi tiếng với khu công nghệ cao (Hsinchu Science Park), thu hút nhiều kỹ sư và công nhân làm việc trong ngành bán dẫn, điện tử — bao gồm cả người Việt. Giá thuê nhà ở đây cao hơn Đài Trung nhưng thấp hơn Đài Bắc. Khu vực phổ biến: Khu Đông, Khu Bắc, Hương Sơn. 8386找房網 tổng hợp tin cho thuê tại Tân Trúc.",
    intro_zh:
      "新竹市為科學園區重鎮，聚集大量科技業從業人員，租金介於台北與台中之間，熱門租屋區域包含東區、北區、香山。",
  },
  {
    slug: "mua-nha-tan-truc",
    type: "buy",
    city: "新竹市",
    cityViLabel: "Tân Trúc",
    cityZhLabel: "新竹市",
    title_vi: "Mua Nhà Tân Trúc - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "新竹買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Tân Trúc",
    h1_zh: "新竹售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Tân Trúc: chung cư gần khu công nghệ cao, giá theo 萬/坪, thông tin song ngữ Trung-Việt.",
    intro_vi:
      "Tân Trúc có mức thu nhập bình quân cao nhờ ngành công nghệ bán dẫn phát triển, kéo theo giá nhà cũng ở mức cao trong khu vực miền Trung-Bắc Đài Loan. Phù hợp với kỹ sư, chuyên gia người Việt có thu nhập ổn định muốn an cư lâu dài. 8386找房網 cập nhật tin bán nhà tại Tân Trúc.",
    intro_zh:
      "新竹市因半導體產業發達，居民所得較高，房價亦相對偏高，適合科技業從業人員長期安家置產。",
  },

  {
    slug: "thue-nha-dai-nam",
    type: "rent",
    city: "台南市",
    cityViLabel: "Đài Nam",
    cityZhLabel: "台南市",
    title_vi: "Thuê Nhà Đài Nam - Nhà Cho Thuê Giá Rẻ Miền Nam | 8386找房網",
    title_zh: "台南租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Đài Nam cho người Việt",
    h1_zh: "台南租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Đài Nam: phòng trọ, chung cư giá rẻ, gần khu công nghiệp Đài Nam, phù hợp công nhân và gia đình người Việt.",
    intro_vi:
      "Đài Nam là thành phố cổ kính ở miền Nam Đài Loan, chi phí sinh hoạt và giá thuê nhà thuộc nhóm thấp nhất trong 8 thành phố lớn, phù hợp với người Việt muốn tiết kiệm chi phí sinh hoạt trong khi vẫn có việc làm ổn định tại các khu công nghiệp lân cận. 8386找房網 tổng hợp tin cho thuê tại Đài Nam.",
    intro_zh:
      "台南市為南部歷史古都，生活及租屋成本在六都中相對較低，適合重視生活開銷的越南朋友。",
  },
  {
    slug: "mua-nha-dai-nam",
    type: "buy",
    city: "台南市",
    cityViLabel: "Đài Nam",
    cityZhLabel: "台南市",
    title_vi: "Mua Nhà Đài Nam - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "台南買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Đài Nam",
    h1_zh: "台南售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Đài Nam: chung cư, nhà phố giá tốt, phù hợp mua nhà lần đầu với ngân sách vừa phải.",
    intro_vi:
      "Đài Nam có mặt bằng giá nhà thấp hơn đáng kể so với Đài Bắc hay Đài Trung, là lựa chọn tốt cho người mua nhà lần đầu hoặc muốn đầu tư với ngân sách vừa phải. 8386找房網 cập nhật tin bán nhà tại Đài Nam.",
    intro_zh:
      "台南市房價在六都中相對親民，適合首購族或預算有限的購屋族群考慮置產。",
  },

  {
    slug: "thue-nha-cao-hung",
    type: "rent",
    city: "高雄市",
    cityViLabel: "Cao Hùng",
    cityZhLabel: "高雄市",
    title_vi: "Thuê Nhà Cao Hùng - Nhà Cho Thuê Miền Nam | 8386找房網",
    title_zh: "高雄租屋 - 出租物件 | 8386找房網",
    h1_vi: "Thuê nhà tại Cao Hùng cho người Việt",
    h1_zh: "高雄租屋資訊",
    metaDescription_vi:
      "Thuê nhà tại Cao Hùng: phòng trọ, chung cư gần cảng và khu công nghiệp, giá thuê hợp lý cho công nhân và gia đình người Việt.",
    intro_vi:
      "Cao Hùng là thành phố cảng lớn nhất miền Nam Đài Loan, có nhiều khu công nghiệp nặng và cảng biển, thu hút đông đảo lao động Việt Nam. Giá thuê nhà tại Cao Hùng thuộc nhóm mềm nhất trong 8 thành phố lớn, phù hợp với công nhân và gia đình muốn tiết kiệm chi phí. 8386找房網 tổng hợp tin cho thuê tại Cao Hùng.",
    intro_zh:
      "高雄市為南部最大港口城市，重工業與港務相關產業聚集，越南籍勞工眾多，租金在六都中相對親民。",
  },
  {
    slug: "mua-nha-cao-hung",
    type: "buy",
    city: "高雄市",
    cityViLabel: "Cao Hùng",
    cityZhLabel: "高雄市",
    title_vi: "Mua Nhà Cao Hùng - Chung Cư, Nhà Phố Bán | 8386找房網",
    title_zh: "高雄買房 - 售屋物件 | 8386找房網",
    h1_vi: "Mua nhà tại Cao Hùng",
    h1_zh: "高雄售屋資訊",
    metaDescription_vi:
      "Mua nhà tại Cao Hùng: chung cư, nhà phố giá tốt tại thành phố cảng lớn nhất miền Nam Đài Loan.",
    intro_vi:
      "Cao Hùng có giá bất động sản thuộc nhóm thấp nhất trong 8 thành phố lớn, phù hợp cho người mua nhà lần đầu hoặc gia đình muốn có không gian sống rộng rãi với ngân sách hợp lý. 8386找房網 cập nhật tin bán nhà tại Cao Hùng.",
    intro_zh:
      "高雄市房價在六都中相對親民，適合首購族或重視居住空間的購屋家庭考慮置產。",
  },
]

export function getSeoLandingPage(slug: string): SeoLandingPage | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug)
}
