"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
} from "lucide-react";
import { format } from "date-fns";
import { useApi } from "@/hooks/useApi";
import TransactionFormModal from "./TransactionFormModal";

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

export default function TransactionsClient() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [transactionToEdit, setTransactionToEdit] =
        useState<Transaction | null>(null);

    const [selectedMonth, setSelectedMonth] = useState<number | "all">(
        new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState<number | "all">(
        new Date().getFullYear(),
    );

    const {
        data: transactions,
        execute: fetchTransactions,
        isLoading,
    } = useApi<Transaction[]>({
        url: "/api/transactions",
    });

    const loadTransactions = () => {
        let url = "/api/transactions";
        const queryParams = [];
        if (selectedMonth !== "all") queryParams.push(`month=${selectedMonth}`);
        if (selectedYear !== "all") queryParams.push(`year=${selectedYear}`);

        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }
        fetchTransactions(undefined, url);
    };

    const { execute: deleteTransaction } = useApi({
        url: "/api/transactions",
        method: "DELETE",
        onSuccess: () => {
            loadTransactions();
        },
        onError: (error) => {
            alert(error || "Failed to delete transaction");
        },
    });

    useEffect(() => {
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?"))
            return;
        await deleteTransaction(undefined, `/api/transactions/${id}`);
    };

    const handleEdit = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setTransactionToEdit(null);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        loadTransactions();
    };

    const filteredTransactions = transactions?.filter((t) => {
        if (selectedMonth === "all" && selectedYear === "all") return true;
        const d = new Date(t.date);
        const matchMonth =
            selectedMonth === "all" || d.getMonth() + 1 === selectedMonth;
        const matchYear =
            selectedYear === "all" || d.getFullYear() === selectedYear;
        return matchMonth && matchYear;
    });

    const handleExportCSV = () => {
        if (!filteredTransactions || filteredTransactions.length === 0) {
            alert("No transactions to export.");
            return;
        }

        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const csvRows = [headers.join(",")];

        filteredTransactions.forEach((t) => {
            const date = format(new Date(t.date), "yyyy-MM-dd");
            const description = t.description
                ? `"${t.description.replace(/"/g, '""')}"`
                : "";
            const category = t.category?.name
                ? `"${t.category.name.replace(/"/g, '""')}"`
                : "";
            const type = t.type;
            const amount = t.amount;

            csvRows.push([date, description, category, type, amount].join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `transactions_export_${format(new Date(), "yyyy-MM-dd")}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR",
        }).format(Number(amount));
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Transactions
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage your income and expenses.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex flex-wrap items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) =>
                            setSelectedMonth(
                                e.target.value === "all"
                                    ? "all"
                                    : Number(e.target.value),
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (m) => (
                                <option key={m} value={m}>
                                    {format(new Date(2000, m - 1), "MMMM")}
                                </option>
                            ),
                        )}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(
                                e.target.value === "all"
                                    ? "all"
                                    : Number(e.target.value),
                            )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">All Years</option>
                        {Array.from(
                            { length: 10 },
                            (_, i) => new Date().getFullYear() - i,
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 cursor-pointer"
                    >
                        <Download className="h-5 w-5" />
                        Export
                    </button>
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Add Transaction
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
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
                                    className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    Amount
                                </th>
                                <th
                                    scope="col"
                                    className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                >
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-slate-50 p-3 dark:bg-slate-800 mb-3">
                                                <Search className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p>No transactions found.</p>
                                            <p className="text-xs mt-1">
                                                Get started by creating a new
                                                transaction.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions?.map((transaction) => (
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
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                                            <div
                                                className={`flex items-center justify-end gap-1 ${
                                                    transaction.type ===
                                                    "income"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-red-600 dark:text-red-400"
                                                }`}
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
                                                    transaction.amount,
                                                )}
                                            </div>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(transaction)
                                                    }
                                                    className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors p-1 cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            transaction.id,
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TransactionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                transactionToEdit={transactionToEdit}
            />
        </div>
    );
}
