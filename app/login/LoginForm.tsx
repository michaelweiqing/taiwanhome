"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

// Format SĐT Đài Loan → email giả để dùng với Supabase Auth
// VD: 0912345678 → 0912345678@taiwanhome.app
function phoneToFakeEmail(phone: string) {
  const clean = phone.replace(/[-\s]/g, "")
  return `${clean}@taiwanhome.app`
}

function validateTWPhone(phone: string) {
  const clean = phone.replace(/[-\s]/g, "")
  return /^09\d{8}$/.test(clean) // SĐT Đài Loan bắt đầu 09, 10 số
}

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [phone, setPhone]     = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [mode, setMode]       = useState<"login" | "register">("register")

  async function handleSubmit() {
    setError("")

    // Validate SĐT
    if (!validateTWPhone(phone)) {
      setError("Vui lòng nhập số điện thoại Đài Loan hợp lệ (09xxxxxxxx)")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự")
      return
    }

    setLoading(true)
    const fakeEmail = phoneToFakeEmail(phone)

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: { phone: phone.replace(/[-\s]/g, "") } // lưu SĐT thật vào metadata
          }
        })
        if (error) throw error
        router.push("/submit")

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password,
        })
        if (error) throw error
        router.push("/submit")
      }
    } catch (err: any) {
      if (err.message.includes("already registered")) {
        setError("Số điện thoại này đã đăng ký. Vui lòng đăng nhập.")
        setMode("login")
      } else if (err.message.includes("Invalid login")) {
        setError("Số điện thoại hoặc mật khẩu không đúng")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

      {/* Tiêu đề */}
      <div className="text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-xl font-black text-gray-900">
          {mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {mode === "register"
            ? "Đăng ký để đăng tin bán/cho thuê nhà"
            : "Chào mừng bạn quay lại"}
        </p>
      </div>

      {/* Tab chọn mode */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[
          { v: "register", label: "Đăng ký" },
          { v: "login",    label: "Đăng nhập" },
        ].map(o => (
          <button key={o.v}
            onClick={() => { setMode(o.v as any); setError("") }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
              ${mode === o.v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Input SĐT */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
          📱 Số điện thoại Đài Loan
        </label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 transition">
          <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 shrink-0">
            🇹🇼 +886
          </span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="0912-345-678"
            className="flex-1 px-3 py-3 text-sm focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">VD: 0912345678 hoặc 0912-345-678</p>
      </div>

      {/* Input mật khẩu */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
          🔒 Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={mode === "register" ? "Tạo mật khẩu (tối thiểu 6 ký tự)" : "Nhập mật khẩu"}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 transition"
        />
      </div>

      {/* Nút submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-sm active:scale-95">
        {loading
          ? "⏳ Đang xử lý..."
          : mode === "register" ? "🚀 Tạo tài khoản" : "→ Đăng nhập"}
      </button>

      {/* Ghi chú */}
      {mode === "register" && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Bằng cách đăng ký, bạn đồng ý để chúng tôi liên hệ qua số điện thoại này khi cần thiết.
        </p>
      )}
    </div>
  )
}