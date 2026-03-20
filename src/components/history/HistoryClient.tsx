"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useApi } from "@/hooks/useApi";
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Wallet,
    Calendar,
} from "lucide-react";
import { formatCurrency } from "@/app/utils/currency";

interface Category {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
}

interface Transaction {
    id: string;
    amount: string;
    type: "income" | "expense";
    description: string | null;
    date: string;
    categoryId: string | null;
    category?: Category | null;
}

export default function HistoryClient() {
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1,
    );

    const {
        data: transactions,
        execute: fetchTransactions,
        isLoading,
    } = useApi<Transaction[]>({
        url: "/api/transactions",
    });

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { availableYears, availableMonths } = useMemo(() => {
        if (!transactions)
            return {
                availableYears: [new Date().getFullYear()],
                availableMonths: Array.from({ length: 12 }, (_, i) => i + 1),
            };

        const years = new Set<number>();
        years.add(new Date().getFullYear()); // Always include current year

        const monthsByYear: Record<number, Set<number>> = {};

        transactions.forEach((t) => {
            const d = new Date(t.date);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;

            years.add(y);
            if (!monthsByYear[y]) monthsByYear[y] = new Set();
            monthsByYear[y].add(m);
        });

        // Always ensure current year has current month at least
        const currY = new Date().getFullYear();
        if (!monthsByYear[currY]) monthsByYear[currY] = new Set();
        monthsByYear[currY].add(new Date().getMonth() + 1);

        return {
            availableYears: Array.from(years).sort((a, b) => b - a), // Descending
            availableMonths: Array.from(monthsByYear[selectedYear] || []).sort(
                (a, b) => a - b,
            ),
        };
    }, [transactions, selectedYear]);

    // Update selected month if it's not available in the newly selected year
    useEffect(() => {
        if (
            availableMonths.length > 0 &&
            !availableMonths.includes(selectedMonth)
        ) {
            setSelectedMonth(availableMonths[availableMonths.length - 1]); // default to latest available month
        }
    }, [selectedYear, availableMonths, selectedMonth]);

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter((t) => {
            const d = new Date(t.date);
            return (
                d.getFullYear() === selectedYear &&
                d.getMonth() + 1 === selectedMonth
            );
        });
    }, [transactions, selectedYear, selectedMonth]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;

        filteredTransactions.forEach((t) => {
            const amt = Number(t.amount);
            if (t.type === "income") income += amt;
            else expense += amt;
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
        };
    }, [filteredTransactions]);

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        History
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View your past financial activity and trends.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Calendar className="h-5 w-5 text-slate-400 ml-2" />
                    <select
                        value={selectedMonth}
                        onChange={(e) =>
                            setSelectedMonth(Number(e.target.value))
                        }
                        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 border-none py-1 pl-2 pr-8 cursor-pointer"
                    >
                        {availableMonths.map((m) => (
                            <option key={m} value={m}>
                                {monthNames[m - 1]}
                            </option>
                        ))}
                    </select>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                        }
                        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 border-none py-1 pl-2 pr-8 cursor-pointer"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Balance
                        </h3>
                        <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-500/10">
                            <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div
                        className={`text-2xl font-bold ${balance < 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
                    >
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

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Transactions for {monthNames[selectedMonth - 1]}{" "}
                        {selectedYear}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-950/50">
                            <tr>
                                <th
                                    scope="col"
                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 sm:pl-6"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    Description
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    Category
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-slate-200 sm:pr-6"
                                >
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-800 mb-3">
                                                <Search className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p>
                                                No transactions found for this
                                                period.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 dark:text-slate-400 sm:pl-6">
                                            {format(
                                                new Date(transaction.date),
                                                "MMM dd, yyyy",
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900 dark:text-slate-200">
                                            {transaction.description || "—"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {transaction.category?.name ? (
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {transaction.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium sm:pr-6">
                                            <div
                                                className={`flex items-center justify-end gap-1 ${transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                            >
                                                {transaction.type ===
                                                "income" ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4" />
                                                )}
                                                {transaction.type === "income"
                                                    ? "+"
                                                    : "-"}
                                                {formatCurrency(
                                                    Number(transaction.amount),
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
