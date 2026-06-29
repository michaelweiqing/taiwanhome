# Hướng dẫn chạy TaiwanHome trên máy mới (máy thứ 2)

App này là **Next.js + Supabase**. Dữ liệu nằm trên Supabase (đám mây) nên 2 máy luôn thấy cùng dữ liệu — chỉ cần đồng bộ **code** qua GitHub.

## Cài 1 lần trên máy mới

1. **Cài công cụ:**
   - [Git](https://git-scm.com/download/win)
   - [Node.js LTS](https://nodejs.org) (phiên bản 18 trở lên)
   - [VS Code](https://code.visualstudio.com)

2. **Lấy code về** (mở Terminal trong VS Code: `Ctrl + ` `):
   ```bash
   git clone https://github.com/michaelweiqing/taiwanhome.git
   cd taiwanhome
   ```

3. **Tạo file `.env.local`** ngay trong thư mục `taiwanhome` với nội dung sau:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://wesvqztwssvbrvugvrcu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3ZxenR3c3N2YnJ2dWd2cmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTQ3NjUsImV4cCI6MjA5NTU5MDc2NX0.ejESXFbALLBb8qmKYN2XyZkupiVOsnreVjQ2_BdznY4
   ANTHROPIC_API_KEY=<chép từ .env.local của máy 1>
   LINE_CHANNEL_TOKEN=<chép từ .env.local của máy 1>
   LINE_ADMIN_USER_ID=<chép từ .env.local của máy 1>
   ```
   > 3 dòng cuối là khóa bí mật, không có trên GitHub. Mở file `.env.local` ở máy 1 và chép giá trị sang.
   > Nếu chỉ cần xem/sửa nhà đất (không cần dịch tự động & thông báo LINE) thì có thể để trống 3 dòng đó.

4. **Cài thư viện & chạy thử:**
   ```bash
   npm install
   npm run dev
   ```
   Mở trình duyệt: http://localhost:3000

## Làm việc hằng ngày (áp dụng cho CẢ 2 máy)

| Khi nào | Lệnh | Ý nghĩa |
|---|---|---|
| **Trước khi** bắt đầu sửa code | `git pull` | Lấy code mới nhất máy kia đã đẩy lên |
| **Sau khi** sửa xong | `git add .` → `git commit -m "mô tả"` → `git push` | Đẩy code lên để máy kia lấy về |

**Nguyên tắc:** luôn `git pull` trước khi làm, `git push` sau khi làm xong.

- **Code** → đồng bộ qua GitHub (lệnh ở trên).
- **Dữ liệu** (nhà đất, người dùng) → tự động đồng bộ qua Supabase, không cần làm gì.
- **File `.env.local`** → KHÔNG đồng bộ qua git (cố ý, để bảo mật). Tạo tay 1 lần trên mỗi máy.

## Dùng nút bấm trong VS Code (thay cho gõ lệnh)

VS Code có sẵn giao diện Git ở thanh bên trái (biểu tượng nhánh cây — Source Control):
- Nút **⋯ → Pull** = `git pull`
- Gõ mô tả → **Commit** → **Sync/Push** = `git add` + `commit` + `push`
