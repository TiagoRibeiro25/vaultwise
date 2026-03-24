"use client"

import { FALLBACK_COLORS } from "@/constants/colors"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface Category {
  id: string
  name: string
  color?: string | null
}

interface Transaction {
  id: string
  amount: string | number
  type: "income" | "expense"
  categoryId: string | null
  category?: Category | null
}

interface CategoryPieChartProps {
  transactions: Transaction[]
}

interface CustomTooltipProps {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const locale = useLocale()
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mb-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {data.name}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-US", {
            style: "currency",
            currency: "EUR",
          }).format(data.value)}
        </p>
      </div>
    )
  }
  return null
}

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const t = useTranslations("Dashboard")
  const tSub = useTranslations("Subscriptions")

  const data = useMemo(() => {
    // We only want to chart expenses
    const expenses = transactions.filter(t => t.type === "expense")

    // Group expenses by category name
    const grouped = expenses.reduce(
      (acc, curr) => {
        const catName = curr.category?.name || tSub("uncategorized")
        const amount = Number(curr.amount)

        if (!acc[catName]) {
          acc[catName] = {
            name: catName,
            value: 0,
            color: curr.category?.color || null,
          }
        }
        acc[catName].value += amount
        return acc
      },
      {} as Record<string, { name: string; value: number; color: string | null }>
    )

    // Sort by value descending and assign fallback colors if missing
    return Object.values(grouped)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
  }, [transactions, tSub])

  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/20">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("noExpenseData")}</p>
      </div>
    )
  }

  return (
    <div className="h-100 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="40%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color as string} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            className="block sm:hidden"
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              paddingTop: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
