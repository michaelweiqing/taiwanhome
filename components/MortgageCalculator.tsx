"use client"
import { useState, useMemo } from "react"
import { useLang } from "@/context/LangContext"

interface Props {
  propertyPrice: number
}

export default function MortgageCalculator({ propertyPrice }: Props) {
  const { lang } = useLang()

  const defaultLoan = Math.round(propertyPrice * 0.7)
  const [loanAmount, setLoanAmount] = useState(defaultLoan)
  const [years, setYears]           = useState(20)
  const [rate, setRate]             = useState("2.5")

  const monthly = useMemo(() => {
    const principal = loanAmount * 10000
    const r = parseFloat(rate) / 100 / 12
    const n = years * 12
    if (!r || !n || !principal) return 0
    return (principal * r) / (1 - Math.pow(1 + r, -n))
  }, [loanAmount, rate, years])

  const totalPay      = monthly * years * 12
  const totalInterest = totalPay - loanAmount * 10000

  const t = {
    title:    lang === "zh" ? "房貸試算"   : "Máy tính vay vốn",
    loanAmt:  lang === "zh" ? "貸款金額"   : "Số tiền vay",
    years:    lang === "zh" ? "貸款年限"   : "Thời hạn vay",
    rate:     lang === "zh" ? "年利率 (%)" : "Lãi suất/năm (%)",
    monthly:  lang === "zh" ? "每月還款"   : "Trả hàng tháng",
    total:    lang === "zh" ? "總還款額"   : "Tổng trả",
    interest: lang === "zh" ? "總利息"     : "Tổng lãi",
    yr:       lang === "zh" ? "年"         : "năm",
    note:     lang === "zh" ? "* 僅供參考" : "* Chỉ mang tính tham khảo",
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-red-500 rounded-full inline-block shrink-0" />
        <h2 className="font-bold text-gray-900">🏦 {t.title}</h2>
      </div>

      <div className="space-y-4">

        {/* Số tiền vay */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-gray-500">{t.loanAmt}</label>
            <span className="text-sm font-bold text-red-600">{loanAmount.toLocaleString()} 萬</span>
          </div>
          <input
            type="range"
            min={100} max={propertyPrice} step={10}
            value={loanAmount}
            onChange={e => setLoanAmount(Number(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>100 萬</span>
            <span>{propertyPrice} 萬</span>
          </div>
        </div>

        {/* Thời hạn */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">{t.years}</label>
          <div className="flex gap-2">
            {[10, 15, 20, 25, 30].map(y => (
              <button key={y}
                onClick={() => setYears(y)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition
                  ${years === y
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"}`}>
                {y}{t.yr}
              </button>
            ))}
          </div>
        </div>

        {/* Lãi suất tự nhập */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.rate}</label>
          <input
            type="number"
            min="0.1" max="30" step="0.1"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-center focus:outline-none focus:border-red-400 transition"
          />
        </div>

        {/* Kết quả */}
        <div className="bg-red-50 rounded-xl p-4 space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">{t.monthly}</p>
            <p className="text-3xl font-black text-red-600">
              NT${Math.round(monthly).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">/ {lang === "zh" ? "月" : "tháng"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-red-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">{t.total}</p>
              <p className="font-bold text-gray-800 text-sm">
                NT${Math.round(totalPay).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">{t.interest}</p>
              <p className="font-bold text-orange-500 text-sm">
                NT${Math.round(totalInterest).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">{t.note}</p>
      </div>
    </div>
  )
}