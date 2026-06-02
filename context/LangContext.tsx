"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import type { Lang, T } from "@/lib/i18n"
import { translations } from "@/lib/i18n"

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: T
}

const LangContext = createContext<LangCtx>({
  lang: "vi",
  setLang: () => {},
  t: translations.zh,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi")
  const t = translations[lang] as T   // ← ép kiểu để TypeScript không lỗi
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
