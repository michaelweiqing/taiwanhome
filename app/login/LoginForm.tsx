"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { useLang } from "@/context/LangContext"
import { Home, AlertTriangle, User, Smartphone, Lock, Loader2, Rocket, CheckCircle2, KeyRound, ArrowLeft } from "lucide-react"

function validateTWPhone(phone: string) {
  return /^09\d{8}$/.test(phone.replace(/[-\s]/g, ""))
}

function cleanPhone(phone: string) {
  return phone.replace(/[-\s]/g, "")
}

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()
  const { lang }  = useLang()

  const [phone, setPhone]       = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [mode, setMode]         = useState<"login"|"register"|"forgot">("register")
  const [forgotPhone, setForgotPhone] = useState("")

  async function handleSubmit() {
    setError("")
    setSuccess("")
    const ph = cleanPhone(phone)

    if (!validateTWPhone(ph)) {
      setError(lang==="zh" ? "請輸入有效的台灣手機號碼（09xxxxxxxx）" : "Vui lòng nhập số điện thoại Đài Loan hợp lệ (09xxxxxxxx)")
      return
    }
    if (password.length < 6) {
      setError(lang==="zh" ? "密碼至少需要6個字元" : "Mật khẩu tối thiểu 6 ký tự")
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
          setError(lang==="zh" ? "此電話號碼已註冊，請登入。" : "Số điện thoại này đã đăng ký. Vui lòng đăng nhập.")
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

        setSuccess(lang==="zh" ? "註冊成功！" : "Đăng ký thành công!")
        setTimeout(() => router.push("/submit"), 1500)

      } else {
        // Đăng nhập
        const { data: user } = await supabase
          .from("app_users")
          .select("id, phone, name, password")
          .eq("phone", ph)
          .maybeSingle()

        if (!user) {
          setError(lang==="zh" ? "此電話號碼尚未註冊。" : "Số điện thoại chưa đăng ký.")
          setLoading(false)
          return
        }
        if (user.password !== password) {
          setError(lang==="zh" ? "密碼錯誤。" : "Mật khẩu không đúng.")
          setLoading(false)
          return
        }

        localStorage.setItem("taiwanhome_user", JSON.stringify({ phone: ph, name: user.name || ph }))
        setSuccess(lang==="zh" ? "登入成功！" : "Đăng nhập thành công!")
        setTimeout(() => router.push("/submit"), 1500)
      }
    } catch (err: any) {
      setError(err.message || (lang==="zh" ? "發生錯誤，請再試一次。" : "Có lỗi xảy ra, vui lòng thử lại."))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError("")
    setSuccess("")
    const ph = cleanPhone(forgotPhone)

    if (!validateTWPhone(ph)) {
      setError(lang==="zh" ? "請輸入有效的台灣手機號碼（09xxxxxxxx）" : "Vui lòng nhập số điện thoại Đài Loan hợp lệ (09xxxxxxxx)")
      return
    }

    setLoading(true)
    try {
      const { data: user } = await supabase
        .from("app_users")
        .select("id, name")
        .eq("phone", ph)
        .maybeSingle()

      if (!user) {
        setError(lang==="zh" ? "此電話號碼尚未註冊帳號。" : "Số điện thoại này chưa đăng ký tài khoản.")
        setLoading(false)
        return
      }

      // Gửi yêu cầu quên mật khẩu qua LINE cho admin xử lý thủ công
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `🔑 Yêu cầu quên mật khẩu!\n📱 SĐT: ${ph}${user.name ? `\n👤 Tên: ${user.name}` : ""}\n🕐 ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Taipei" })}`
        })
      }).catch(() => {})

      setSuccess(lang==="zh"
        ? "請求已送出！我們將盡快透過此電話號碼與您聯繫，協助重設密碼。"
        : "Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ qua số điện thoại này trong thời gian sớm nhất để hỗ trợ đặt lại mật khẩu.")
      setForgotPhone("")
    } catch (err: any) {
      setError(err.message || (lang==="zh" ? "發生錯誤，請再試一次。" : "Có lỗi xảy ra, vui lòng thử lại."))
    } finally {
      setLoading(false)
    }
  }

  // Màn hình "Quên mật khẩu"
  if (mode === "forgot") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <KeyRound size={26} strokeWidth={2} className="text-red-500" />
          </div>
          <h1 className="text-xl font-black text-gray-900">{lang==="zh" ? "忘記密碼" : "Quên mật khẩu"}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {lang==="zh" ? "請輸入已註冊的電話號碼，我們將與您聯繫協助重設密碼" : "Nhập số điện thoại đã đăng ký, chúng tôi sẽ liên hệ để hỗ trợ đặt lại mật khẩu"}
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 size={16} strokeWidth={2.2} /> {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} strokeWidth={2.2} className="shrink-0" /> {error}
          </div>
        )}

        {!success && (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Smartphone size={13} strokeWidth={2.2} /> {lang==="zh" ? "台灣電話號碼" : "Số điện thoại Đài Loan"}</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 transition">
                <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 shrink-0">+886</span>
                <input type="tel" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && handleForgotPassword()}
                  placeholder="0912-345-678"
                  className="flex-1 px-3 py-3 text-sm focus:outline-none" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{lang==="zh" ? "註冊帳號時使用的電話號碼" : "Số điện thoại đã dùng để đăng ký tài khoản"}</p>
            </div>

            <button onClick={handleForgotPassword} disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-sm active:scale-95 flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> {lang==="zh" ? "傳送中..." : "Đang gửi..."}</>
                : (lang==="zh" ? "送出請求" : "Gửi yêu cầu")}
            </button>
          </>
        )}

        <button onClick={() => { setMode("login"); setError(""); setSuccess(""); setForgotPhone("") }}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition py-1">
          <ArrowLeft size={14} strokeWidth={2.2} /> {lang==="zh" ? "返回登入" : "Quay lại đăng nhập"}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

      {/* Tiêu đề */}
      <div className="text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Home size={26} strokeWidth={2} className="text-red-500" />
        </div>
        <h1 className="text-xl font-black text-gray-900">
          {mode === "register" ? (lang==="zh" ? "建立帳號" : "Tạo tài khoản") : (lang==="zh" ? "登入" : "Đăng nhập")}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {mode === "register"
            ? (lang==="zh" ? "註冊以刊登買賣/租屋物件" : "Đăng ký để đăng tin bán/cho thuê nhà")
            : (lang==="zh" ? "歡迎回來" : "Chào mừng bạn quay lại")}
        </p>
      </div>

      {/* Tab mode */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[
          {v:"register", label: lang==="zh" ? "註冊" : "Đăng ký"},
          {v:"login",    label: lang==="zh" ? "登入" : "Đăng nhập"},
        ].map(o => (
          <button key={o.v} onClick={() => { setMode(o.v as any); setError(""); setSuccess("") }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              mode===o.v ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Thông báo thành công */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 size={16} strokeWidth={2.2} /> {success}
        </div>
      )}

      {/* Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle size={15} strokeWidth={2.2} className="shrink-0" /> {error}
        </div>
      )}

      {/* Tên (chỉ khi đăng ký) */}
      {mode === "register" && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><User size={13} strokeWidth={2.2} /> {lang==="zh" ? "您的姓名（選填）" : "Tên của bạn (không bắt buộc)"}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={lang==="zh" ? "王小明" : "Nguyễn Văn A"}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
        </div>
      )}

      {/* SĐT */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Smartphone size={13} strokeWidth={2.2} /> {lang==="zh" ? "台灣電話號碼" : "Số điện thoại Đài Loan"}</label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 transition">
          <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r border-gray-200 shrink-0">+886</span>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0912-345-678"
            className="flex-1 px-3 py-3 text-sm focus:outline-none" />
        </div>
        <p className="text-xs text-gray-400 mt-1">{lang==="zh" ? "例如：0912345678 或 0912-345-678" : "VD: 0912345678 hoặc 0912-345-678"}</p>
      </div>

      {/* Mật khẩu */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Lock size={13} strokeWidth={2.2} /> {lang==="zh" ? "密碼" : "Mật khẩu"}</label>
          {mode === "login" && (
            <button type="button"
              onClick={() => { setMode("forgot"); setError(""); setSuccess(""); setForgotPhone(phone) }}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition">
              {lang==="zh" ? "忘記密碼？" : "Quên mật khẩu?"}
            </button>
          )}
        </div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder={mode==="register"
            ? (lang==="zh" ? "設定密碼（至少6個字元）" : "Tạo mật khẩu (tối thiểu 6 ký tự)")
            : (lang==="zh" ? "輸入密碼" : "Nhập mật khẩu")}
          onKeyDown={e => e.key==="Enter" && handleSubmit()}
          className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 transition" />
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-sm active:scale-95 flex items-center justify-center gap-2">
        {loading
          ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> {lang==="zh" ? "處理中..." : "Đang xử lý..."}</>
          : mode==="register"
            ? <><Rocket size={16} strokeWidth={2.2} /> {lang==="zh" ? "建立帳號" : "Tạo tài khoản"}</>
            : (lang==="zh" ? "登入" : "Đăng nhập")}
      </button>

      {mode==="register" && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          {lang==="zh"
            ? "註冊即表示您同意我們在必要時透過此電話號碼與您聯繫。"
            : "Bằng cách đăng ký, bạn đồng ý để chúng tôi liên hệ qua số điện thoại này khi cần thiết."}
        </p>
      )}
    </div>
  )
}
