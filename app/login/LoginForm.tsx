"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [mode, setMode]         = useState<"login"|"register">("login")

  async function handleSubmit() {
    setLoading(true); setError("")
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    if (error) setError(error.message)
    else router.push("/submit")
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <h1 className="text-xl font-black text-gray-900 text-center">
        {mode === "login" ? "🔐 Đăng nhập" : "📝 Đăng ký"}
      </h1>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)}
        type="email" placeholder="Email"
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
      <input value={password} onChange={e => setPassword(e.target.value)}
        type="password" placeholder="Mật khẩu"
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
        {loading ? "..." : (mode === "login" ? "Đăng nhập" : "Đăng ký")}
      </button>
      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <button onClick={() => setMode(m => m === "login" ? "register" : "login")}
          className="text-red-600 font-semibold">
          {mode === "login" ? "Đăng ký" : "Đăng nhập"}
        </button>
      </p>
    </div>
  )
}