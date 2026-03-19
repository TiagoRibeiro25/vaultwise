"use client";

import Link from "next/link";
import {
    Home,
    CreditCard,
    PieChart,
    Tag,
    History,
    RefreshCw,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { usePathname } from "next/navigation";

interface SidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathName = usePathname();

    return (
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:flex">
            <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
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
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <Home className="h-5 w-5" />
                    Dashboard
                </Link>
                <Link
                    href="/dashboard/transactions"
                    className={
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
                        (pathName === "/dashboard/transactions"
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Transactions
                </Link>
                <Link
                    href="/dashboard/categories"
                    className={
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
                        (pathName === "/dashboard/categories"
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <Tag className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Categories
                </Link>
                <Link
                    href="/dashboard/budgets"
                    className={
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
                        (pathName === "/dashboard/budgets"
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <PieChart className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Budgets
                </Link>
                <Link
                    href="/dashboard/subscriptions"
                    className={
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
                        (pathName === "/dashboard/subscriptions"
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <RefreshCw className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Subscriptions
                </Link>
                <Link
                    href="/dashboard/history"
                    className={
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ` +
                        (pathName === "/dashboard/history"
                            ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white")
                    }
                >
                    <History className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    History
                </Link>
            </nav>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold shadow-sm">
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
                    </div>
                </div>
                <div className="flex flex-col gap-2 px-2">
                    <ThemeToggle />
                    <LogoutButton />
                </div>
            </div>
        </aside>
    );
}
