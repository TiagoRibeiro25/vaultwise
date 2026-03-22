"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import {
    Menu,
    X,
    Home,
    CreditCard,
    PieChart,
    Tag,
    History,
    RefreshCw,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useTranslations } from "next-intl";

interface MobileNavProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname();
    const t = useTranslations("Navigation");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [savedPathname, setSavedPathname] = useState<string>(pathname);

    // Close menu automatically on route change by deriving state during render
    if (pathname !== savedPathname) {
        setSavedPathname(pathname);
        setIsOpen(false);
    }

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="sm:hidden">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                    Vaultwise
                </span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="relative flex w-full flex-1 flex-col bg-white pt-5 pb-4 dark:bg-slate-950 shadow-xl">
                        <div className="flex shrink-0 items-center justify-between px-6">
                            <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                                Vaultwise
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="mt-8 h-0 flex-1 overflow-y-auto">
                            <nav className="px-4 space-y-2">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <Home
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname === "/dashboard"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("dashboard")}
                                </Link>
                                <Link
                                    href="/dashboard/transactions"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard/transactions"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <CreditCard
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname ===
                                            "/dashboard/transactions"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("transactions")}
                                </Link>
                                <Link
                                    href="/dashboard/categories"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard/categories"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <Tag
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname === "/dashboard/categories"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("categories")}
                                </Link>
                                <Link
                                    href="/dashboard/budgets"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard/budgets"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <PieChart
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname === "/dashboard/budgets"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("budgets")}
                                </Link>
                                <Link
                                    href="/dashboard/subscriptions"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard/subscriptions"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <RefreshCw
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname ===
                                            "/dashboard/subscriptions"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("subscriptions")}
                                </Link>
                                <Link
                                    href="/dashboard/history"
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                                        pathname === "/dashboard/history"
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`}
                                >
                                    <History
                                        className={`mr-4 h-6 w-6 shrink-0 transition-colors ${
                                            pathname === "/dashboard/history"
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-white"
                                        }`}
                                    />
                                    {t("history")}
                                </Link>
                            </nav>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-2 mb-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 py-2 transition-colors cursor-pointer"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold shadow-sm">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user?.email}
                                    </span>
                                </div>
                            </Link>
                            <div className="flex flex-col gap-2 px-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
