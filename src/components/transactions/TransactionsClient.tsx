"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Search,
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

    const {
        data: transactions,
        execute: fetchTransactions,
        isLoading,
    } = useApi<Transaction[]>({
        url: "/api/transactions",
    });

    const { execute: deleteTransaction } = useApi({
        url: "/api/transactions",
        method: "DELETE",
        onSuccess: () => {
            fetchTransactions();
        },
        onError: (error) => {
            alert(error || "Failed to delete transaction");
        },
    });

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        fetchTransactions();
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
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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
                            ) : transactions?.length === 0 ? (
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
                                transactions?.map((transaction) => (
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
