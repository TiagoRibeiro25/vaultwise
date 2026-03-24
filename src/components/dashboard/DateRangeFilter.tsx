"use client"

import { useTranslations } from "next-intl"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function DateRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("Dashboard")

  const currentRange = searchParams.get("range") || "all"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + "?" + createQueryString("range", e.target.value))
    router.refresh()
  }

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="range-filter"
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {t("view")}
      </label>
      <select
        key={currentRange}
        id="range-filter"
        defaultValue={currentRange}
        onChange={handleRangeChange}
        className="block w-full rounded-md border-0 py-1.5 pr-10 pl-3 text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
      >
        <option value="month">{t("thisMonth")}</option>
        <option value="6months">{t("last6Months")}</option>
        <option value="year">{t("thisYear")}</option>
        <option value="all">{t("allTime")}</option>
      </select>
    </div>
  )
}
