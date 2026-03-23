"use client";

import { formatCurrency } from "@/utils/currency";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useApi } from "@/hooks/useApi";
import { format } from "date-fns";
import { enUS, pt } from "date-fns/locale";
import {
    ArrowDownRight,
    ArrowUpRight,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ExportCsvButton from "./ExportCsvButton";
import TransactionFormModal from "./TransactionFormModal";

interface Category {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
}

export interface Transaction {
    id: string;
    amount: string;
    type: "income" | "expense";
    description: string | null;
    date: string;
    categoryId: string | null;
    category?: Category | null;
}

export default function TransactionsClient() {
    const t = useTranslations("Transactions");
    const locale = useLocale();
    const dateLocale = locale === "pt" ? pt : enUS;
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
            toast.error(error || "Failed to delete transaction");
        },
    });

    useEffect(() => {
        loadTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedYear]);

    const [transactionToDelete, setTransactionToDelete] = useState<
        string | null
    >(null);

    const handleDelete = async (id: string) => {
        setTransactionToDelete(id);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        await deleteTransaction(
            undefined,
            `/api/transactions/${transactionToDelete}`,
        );
        setTransactionToDelete(null);
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

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t("title")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("subtitle")}
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                        <option value="all">{t("allMonths")}</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (m) => (
                                <option key={m} value={m}>
                                    {format(new Date(2000, m - 1), "MMMM", {
                                        locale: dateLocale,
                                    })}
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                        <option value="all">{t("allYears")}</option>
                        {Array.from(
                            { length: 10 },
                            (_, i) => new Date().getFullYear() - i,
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <ExportCsvButton
                        filteredTransactions={filteredTransactions || null}
                    />
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        {t("addTransaction")}
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
                                    {t("date")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    {t("description")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    {t("category")}
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-slate-200"
                                >
                                    {t("amount")}
                                </th>
                                <th
                                    scope="col"
                                    className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                >
                                    <span className="sr-only">
                                        {t("actions")}
                                    </span>
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
                                        {t("loading")}
                                    </td>
                                </tr>
                            ) : filteredTransactions?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
                                                <div className="rounded-full bg-slate-100 p-3 mb-4 dark:bg-slate-800">
                                                    <Search className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <p>{t("noTransactions")}</p>
                                                <p className="text-xs mt-1">
                                                    {t("getStarted")}
                                                </p>
                                            </div>
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
                                                { locale: dateLocale },
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
                                                    Number(transaction.amount),
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
                                                    title={t("edit")}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        {t("edit")}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            transaction.id,
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                                                    title={t("delete")}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        {t("delete")}
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
            <ConfirmModal
                isOpen={!!transactionToDelete}
                title={t("deleteTitle")}
                message={t("deleteMessage")}
                confirmText={t("delete")}
                onConfirm={confirmDelete}
                onCancel={() => setTransactionToDelete(null)}
                isDestructive
            />
        </div>
    );
}
