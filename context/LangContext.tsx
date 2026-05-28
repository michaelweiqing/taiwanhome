"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import type { Lang } from "@/lib/i18n"
import { translations } from "@/lib/i18n"

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: typeof translations.zh }
const LangContext = createContext<LangCtx>({ lang: "zh", setLang: () => {}, t: translations.zh })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh")
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() { return useContext(LangContext) }
