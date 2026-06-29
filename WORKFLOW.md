# Quy trình làm việc giữa 2 máy

Điểm mấu chốt: **2 loại thay đổi khác nhau, xử lý khác nhau.**

| Loại | Ví dụ | Đồng bộ thế nào | Cần làm gì? |
|---|---|---|---|
| **Cập nhật thông tin (dữ liệu)** | Thêm/sửa/xóa nhà đất, người dùng đăng tin | Tự động qua **Supabase** | ❌ Không cần làm gì |
| **Sửa code (app)** | Đổi giao diện, thêm tính năng, sửa logic | Thủ công qua **git/GitHub** | ✅ Phải `pull` / `push` |

> Nói ngắn: **đổi dữ liệu → tự đồng bộ. Đổi code → phải đẩy git.**

---

## A. Khi chỉ CẬP NHẬT THÔNG TIN (không đụng code)

Không cần thao tác git. Vào app (máy nào cũng được) → thêm/sửa nhà đất → lưu.
Máy kia chỉ cần **tải lại trang (F5)** là thấy dữ liệu mới (dữ liệu nằm trên Supabase).

---

## B. Khi SỬA CODE — quy trình mỗi lần ngồi vào 1 máy

### Bước 1 — TRƯỚC khi bắt đầu sửa (lấy bản mới nhất)
```powershell
git pull
```
Luôn làm bước này đầu tiên.

### Bước 2 — Sửa code & chạy thử
```powershell
npm run dev
```
Chỉ chạy `npm install` lại **nếu** bản `git pull` về có thay đổi trong `package.json`.

### Bước 3 — SAU khi sửa xong (đẩy lên cho máy kia)
```powershell
git add .
git commit -m "mô tả ngắn việc vừa làm"
git push
```

---

## Sơ đồ tóm tắt

```
        +----------- Máy 1 -----------+         +----------- Máy 2 -----------+
CODE:   |  git pull -> sửa -> push    | ------> |  git pull -> sửa -> push    |
        +-----------------------------+  GitHub +-----------------------------+

DỮ LIỆU: Máy 1 <---- tự động real-time ----> Máy 2   (qua Supabase, không thao tác)
```

---

## 3 lỗi thường gặp & cách tránh

1. **Quên `git pull` trước khi làm** → code 2 máy lệch nhau, dễ xung đột.
   → Luôn `git pull` đầu tiên.

2. **Báo "conflict" khi pull/push** (cả 2 máy cùng sửa 1 file) → do quên pull.
   → Làm xong ở máy này thì `push` ngay; sang máy kia `pull` ngay trước khi làm.
   Đừng để dở dang ở 2 máy cùng lúc.

3. **File `.env.local` KHÔNG đi theo git** (cố ý, để bảo mật) → máy mới phải tự tạo 1 lần.
   Nếu sau này đổi/thêm khóa, phải sửa tay trên **cả 2 máy**.

---

## Mẹo: dùng nút bấm trong VS Code thay vì gõ lệnh

Bấm biểu tượng **Source Control** (nhánh cây) ở thanh trái:
- **Sync Changes (⟳)** = `git pull` + `git push` cùng lúc
- Gõ mô tả vào ô trên → **Commit** → bấm **Sync** để đẩy lên

---

## Thiết lập máy mới lần đầu

Xem file [SETUP.md](./SETUP.md).
