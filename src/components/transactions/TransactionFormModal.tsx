"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Category {
    id: string;
    name: string;
    color?: string;
    icon?: string;
}

interface Transaction {
    id: string;
    amount: string;
    type: "income" | "expense";
    description: string | null;
    date: string;
    categoryId: string | null;
}

interface TransactionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transactionToEdit?: Transaction | null;
}

export default function TransactionFormModal({
    isOpen,
    onClose,
    onSuccess,
    transactionToEdit,
}: TransactionFormModalProps) {
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [date, setDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );
    const [categoryId, setCategoryId] = useState<string>("");

    const [prevIsOpen, setPrevIsOpen] = useState(false);
    const [prevTransactionToEdit, setPrevTransactionToEdit] = useState<
        Transaction | null | undefined
    >(undefined);

    const { data: categories, execute: fetchCategories } = useApi<Category[]>({
        url: "/api/categories",
    });

    const {
        execute: saveTransaction,
        isLoading,
        error,
    } = useApi({
        url: transactionToEdit
            ? `/api/transactions/${transactionToEdit.id}`
            : "/api/transactions",
        method: transactionToEdit ? "PUT" : "POST",
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    if (isOpen !== prevIsOpen || transactionToEdit !== prevTransactionToEdit) {
        setPrevIsOpen(isOpen);
        setPrevTransactionToEdit(transactionToEdit);

        if (isOpen) {
            fetchCategories();
            if (transactionToEdit) {
                setType(transactionToEdit.type);
                setAmount(transactionToEdit.amount);
                setDescription(transactionToEdit.description || "");
                setDate(
                    new Date(transactionToEdit.date)
                        .toISOString()
                        .split("T")[0],
                );
                setCategoryId(transactionToEdit.categoryId || "");
            } else {
                setType("expense");
                setAmount("");
                setDescription("");
                setDate(new Date().toISOString().split("T")[0]);
                setCategoryId("");
            }
        }
    }

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId) {
            alert("Please select a category.");
            return;
        }

        await saveTransaction({
            type,
            amount: parseFloat(amount),
            description,
            date,
            categoryId,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:border dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
                        {transactionToEdit
                            ? "Edit Transaction"
                            : "New Transaction"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form
                        id="transaction-form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Type Toggle */}
                        <div className="flex rounded-lg shadow-sm ring-1 ring-slate-300 dark:ring-slate-700 p-1 bg-slate-50 dark:bg-slate-950">
                            <button
                                type="button"
                                onClick={() => setType("expense")}
                                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
                                    type === "expense"
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 cursor-pointer"
                                }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("income")}
                                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
                                    type === "income"
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 cursor-pointer"
                                }`}
                            >
                                Income
                            </button>
                        </div>

                        {/* Amount */}
                        <div>
                            <label
                                htmlFor="amount"
                                className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2"
                            >
                                Amount
                            </label>
                            <div className="relative mt-2 rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">
                                        €
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    id="amount"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full rounded-lg border-0 py-2.5 pl-7 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2"
                            >
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                id="description"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                placeholder="E.g., Groceries, Salary, Rent"
                            />
                        </div>

                        {/* Category and Date Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2"
                                >
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    id="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500 dark:[color-scheme:dark]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="categoryId"
                                    className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2"
                                >
                                    Category
                                </label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    required
                                    value={categoryId}
                                    onChange={(e) =>
                                        setCategoryId(e.target.value)
                                    }
                                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                >
                                    <option value="" disabled>
                                        Select a category
                                    </option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="transaction-form"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900 cursor-pointer"
                    >
                        {isLoading ? "Saving..." : "Save Transaction"}
                    </button>
                </div>
            </div>
        </div>
    );
}
