import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
    ArrowUpRight,
    ArrowDownRight,
    Euro,
    Wallet,
    ChevronRight,
} from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfYear,
} from "date-fns";
import MonthlyBarChart from "@/components/dashboard/MonthlyBarChart";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import { formatCurrency } from "../utils/currency";
import Link from "next/link";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const resolvedSearchParams = await searchParams;
    const range = resolvedSearchParams.range || "all";
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (range === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    } else if (range === "6months") {
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
    } else if (range === "year") {
        startDate = startOfYear(now);
        endDate = endOfMonth(now);
    }

    const dateFilter =
        startDate && endDate
            ? and(
                  gte(transactions.date, startDate),
                  lte(transactions.date, endDate),
              )
            : undefined;

    // Fetch transactions based on filter
    const allTransactions = await db.query.transactions.findMany({
        where: and(eq(transactions.userId, session.user.id), dateFilter),
        orderBy: [desc(transactions.date)],
        with: {
            category: true,
        },
    });

    // Calculate totals for all time
    const totalIncome = allTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = allTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Welcome back, {session.user.name}. Here&apos;s your
                        financial overview.
                    </p>
                </div>
                <Suspense fallback={null}>
                    <DateRangeFilter />
                </Suspense>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Total Balance
                        </h3>
                        <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-500/10">
                            <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(balance)}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Total Income
                        </h3>
                        <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-500/10">
                            <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalIncome)}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Total Expenses
                        </h3>
                        <div className="rounded-full bg-red-50 p-2 dark:bg-red-500/10">
                            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totalExpense)}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Income vs Expenses
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {range === "month"
                                ? "This month"
                                : range === "6months"
                                  ? "Last 6 months"
                                  : range === "year"
                                    ? "This year"
                                    : "All time"}
                        </p>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <div className="min-w-125">
                            <MonthlyBarChart
                                transactions={allTransactions.map((t) => ({
                                    ...t,
                                    type: t.type as "income" | "expense",
                                }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Expenses by Category
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {range === "month"
                                ? "This month"
                                : range === "6months"
                                  ? "Last 6 months"
                                  : range === "year"
                                    ? "This year"
                                    : "All time"}
                        </p>
                    </div>
                    <div className="p-6">
                        <CategoryPieChart
                            transactions={allTransactions.map((t) => ({
                                ...t,
                                type: t.type as "income" | "expense",
                            }))}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Recent Transactions
                    </h2>
                    <Link
                        href="/dashboard/history"
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>
                <div className="p-6">
                    {allTransactions.length > 0 ? (
                        <div className="space-y-4">
                            {allTransactions.slice(0, 5).map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                transaction.type === "income"
                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                            }`}
                                        >
                                            {transaction.type === "income" ? (
                                                <ArrowUpRight className="h-5 w-5" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {transaction.description ||
                                                    "Untitled Transaction"}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {format(
                                                    new Date(transaction.date),
                                                    "MMM dd, yyyy",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`font-semibold ${
                                            transaction.type === "income"
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-red-600 dark:text-red-400"
                                        }`}
                                    >
                                        {transaction.type === "income"
                                            ? "+"
                                            : "-"}
                                        {formatCurrency(
                                            Number(transaction.amount),
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-800">
                                <Euro className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                                No transactions
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Get started by creating a new transaction.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
