"use client"

import LogoutButton from "@/components/auth/LogoutButton"
import LanguageSwitcher from "@/components/layout/LanguageSwitcher"
import ThemeToggle from "@/components/layout/ThemeToggle"
import { Link, usePathname } from "@/i18n/routing"
import { CreditCard, History, Home, PieChart, RefreshCw, Tag } from "lucide-react"
import { useTranslations } from "next-intl"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathName = usePathname()
  const t = useTranslations("Navigation")

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white sm:flex dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          Vaultwise
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <Link
          href="/dashboard"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <Home className="h-5 w-5" />
          {t("dashboard")}
        </Link>
        <Link
          href="/dashboard/transactions"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard/transactions"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          {t("transactions")}
        </Link>
        <Link
          href="/dashboard/categories"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard/categories"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <Tag className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          {t("categories")}
        </Link>
        <Link
          href="/dashboard/budgets"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard/budgets"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <PieChart className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          {t("budgets")}
        </Link>
        <Link
          href="/dashboard/subscriptions"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard/subscriptions"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <RefreshCw className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          {t("subscriptions")}
        </Link>
        <Link
          href="/dashboard/history"
          className={
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
            (pathName === "/dashboard/history"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
          }
        >
          <History className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          {t("history")}
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <Link
          href="/dashboard/profile"
          className="mb-2 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user?.name}
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </span>
            </div>
          </div>
        </Link>
        <div className="flex flex-col gap-2 px-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
