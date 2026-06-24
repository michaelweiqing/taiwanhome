"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

function validateTWPhone(phone: string) {
  return /^09\d{8}$/.test(phone.replace(/[-\s]/g, ""))
}

function cleanPhone(phone: string) {
  return phone.replace(/[-\s]/g, "")
}

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [phone, setPhone]       = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [mode, setMode]         = useState<"login"|"register">("register")

  async function handleSubmit() {
    setError("")
    setSuccess("")
    const ph = cleanPhone(phone)

    if (!validateTWPhone(ph)) {
      setError("Vui lòng nhập số điện thoại Đài Loan hợp lệ (09xxxxxxxx)")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự")
      return
    }

    setLoading(true)
    try {
      if (mode === "register") {
        // Kiểm tra SĐT đã tồn tại chưa
        const { data: existing } = await supabase
          .from("app_users")
          .select("id")
          .eq("phone", ph)
          .maybeSingle()

        if (existing) {
          setError("Số điện thoại này đã đăng ký. Vui lòng đăng nhập.")
          setMode("login")
          setLoading(false)
          return
        }

        // Tạo tài khoản mới
        const { error: insertErr } = await supabase
          .from("app_users")
          .insert({ phone: ph, password, name: name || null })

        if (insertErr) throw insertErr

        // Lưu session localStorage
        localStorage.setItem("taiwanhome_user", JSON.stringify({ phone: ph, name: name || ph }))

        // Thông báo LINE cho Michael
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `🆕 Tài khoản mới đăng ký!\n📱 SĐT: ${ph}${name ? `\n👤 Tên: ${name}` : ""}\n🕐 ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Taipei" })}`
          })
        }).catch(() => {})

        setSuccess("🎉 Đăng ký thành công!")
        setTimeout(() => router.push("/submit"), 1500)

      } else {
        // Đăng nhập
        const { data: user } = await supabase
          .from("app_users")
          .select("id, phone, name, password")
          .eq("phone", ph)
          .maybeSingle()

        if (!user) {
          setError("Số điện thoại chưa đăng ký.")
          setLoading(false)
          return
        }
        if (user.password !== password) {
          setError("Mật khẩu không đúng.")
          setLoading(false)
          return
        }

        localStorage.setItem("taiwanhome_user", JSON.stringify({ phone: ph, name: user.name || ph }))
        setSuccess("✅ Đăng nhập thành công!")
        setTimeout(() => router.push("/submit"), 1500)
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.")
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
          {mode === "register" ? "Đăng ký để đăng tin bán/cho thuê nhà" : "Chào mừng bạn quay lại"}
        </p>
      </div>

      {/* Tab mode */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[{v:"register",label:"Đăng ký"},{v:"login",label:"Đăng nhập"}].map(o => (
          <button key={o.v} onClick={() => { setMode(o.v as any); setError(""); setSuccess("") }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              mode===o.v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Thông báo thành công */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl text-center font-medium">
          {success}
        </div>
      )}

      {/* Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Tên (chỉ khi đăng ký) */}
      {mode === "register" && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">👤 Tên của bạn (không bắt buộc)</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
        </div>
      )}

      {/* SĐT */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">📱 Số điện thoại Đài Loan</label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 transition">
          <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 shrink-0">🇹🇼 +886</span>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0912-345-678"
            className="flex-1 px-3 py-3 text-sm focus:outline-none" />
        </div>
        <p className="text-xs text-gray-400 mt-1">VD: 0912345678 hoặc 0912-345-678</p>
      </div>

      {/* Mật khẩu */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">🔒 Mật khẩu</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder={mode==="register" ? "Tạo mật khẩu (tối thiểu 6 ký tự)" : "Nhập mật khẩu"}
          onKeyDown={e => e.key==="Enter" && handleSubmit()}
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-sm active:scale-95">
        {loading ? "⏳ Đang xử lý..." : mode==="register" ? "🚀 Tạo tài khoản" : "→ Đăng nhập"}
      </button>

      {mode==="register" && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Bằng cách đăng ký, bạn đồng ý để chúng tôi liên hệ qua số điện thoại này khi cần thiết.
        </p>
      )}
    </div>
  )
}
