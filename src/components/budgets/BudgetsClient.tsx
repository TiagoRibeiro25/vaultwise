"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Euro } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { format } from "date-fns";
import BudgetFormModal from "./BudgetFormModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/app/[locale]/utils/currency";

type Category = {
    id: string;
    name: string;
    color: string;
    icon: string;
};

type Budget = {
    id: string;
    categoryId: string;
    amount: string;
    month: number;
    year: number;
    category?: Category;
};

type Transaction = {
    id: string;
    categoryId: string;
    amount: string;
    type: "income" | "expense";
    date: string;
};

type BudgetWithSpent = Budget & {
    spent: number;
    percentage: number;
};

export default function BudgetsClient() {
    const [currentDate] = useState<Date>(new Date());
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    const {
        data: budgets,
        isLoading: loadingBudgets,
        execute: fetchBudgets,
    } = useApi<Budget[]>({
        url: `/api/budgets?month=${currentMonth}&year=${currentYear}`,
    });

    const { execute: fetchCategories } = useApi<Category[]>({
        url: "/api/categories",
    });

    const { data: transactions, execute: fetchTransactions } = useApi<
        Transaction[]
    >({
        url: "/api/transactions",
    });

    const { execute: deleteBudgetApi, isLoading: isDeleting } = useApi({
        url: "/api/budgets",
        method: "DELETE",
    });

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
        fetchTransactions();
    }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

    // Calculate spent amounts
    const budgetsWithSpent: BudgetWithSpent[] = (budgets || []).map(
        (budget) => {
            const spent = (transactions || [])
                .filter((t) => {
                    if (
                        t.type !== "expense" ||
                        t.categoryId !== budget.categoryId
                    )
                        return false;
                    const tDate = new Date(t.date);
                    return (
                        tDate.getMonth() + 1 === budget.month &&
                        tDate.getFullYear() === budget.year
                    );
                })
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const amountNum = Number(budget.amount);
            const percentage = amountNum > 0 ? (spent / amountNum) * 100 : 0;

            return {
                ...budget,
                spent,
                percentage,
            };
        },
    );

    const handleOpenModal = (budget?: Budget) => {
        setEditingBudget(budget || null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setBudgetToDelete(id);
    };

    const confirmDelete = async () => {
        if (!budgetToDelete) return;

        const result = (await deleteBudgetApi(
            null,
            `/api/budgets/${budgetToDelete}`,
        )) as {
            error?: string;
        } | null;
        if (!result?.error) {
            fetchBudgets();
        }
        setBudgetToDelete(null);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-amber-400";
        return "bg-emerald-500";
    };

    const getTextColor = (percentage: number) => {
        if (percentage >= 100) return "text-red-600 dark:text-red-400";
        if (percentage >= 80) return "text-amber-600 dark:text-amber-400";
        return "text-emerald-600 dark:text-emerald-400";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {useTranslations("Budgets")("title")}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {useTranslations("Budgets")("subtitle")}{" "}
                        {format(currentDate, "MMMM yyyy")}.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-indigo-500"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {useTranslations("Budgets")("addBudget")}
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="p-6">
                    {loadingBudgets ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        </div>
                    ) : budgetsWithSpent.length > 0 ? (
                        <div className="space-y-6">
                            {budgetsWithSpent.map((budget) => (
                                <div key={budget.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                                style={{
                                                    backgroundColor:
                                                        budget.category
                                                            ?.color ||
                                                        "#cbd5e1",
                                                }}
                                            >
                                                {budget.category?.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {budget.category?.name ||
                                                        "Unknown Category"}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {formatCurrency(
                                                        budget.spent,
                                                    )}{" "}
                                                    of{" "}
                                                    {formatCurrency(
                                                        Number(budget.amount),
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p
                                                    className={`font-semibold ${getTextColor(budget.percentage)}`}
                                                >
                                                    {budget.percentage.toFixed(
                                                        0,
                                                    )}
                                                    %
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {Number(budget.amount) -
                                                        budget.spent >
                                                    0
                                                        ? `${formatCurrency(Number(budget.amount) - budget.spent)} left`
                                                        : "Over budget"}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(budget)
                                                    }
                                                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(budget.id)
                                                    }
                                                    disabled={isDeleting}
                                                    className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                                            style={{
                                                width: `${Math.min(budget.percentage, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    {budget.percentage >= 100 && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            <span>
                                                You have exceeded your budget
                                                for this category.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-slate-50 p-4 dark:bg-slate-800">
                                <Euro className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                No budgets set for this month
                            </h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                                Create a budget to start tracking your spending
                                and ensure you stay within your limits.
                            </p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:hover:bg-indigo-500"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first budget
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BudgetFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchBudgets()}
                budgetToEdit={editingBudget}
                currentMonth={currentMonth}
                currentYear={currentYear}
            />

            <ConfirmModal
                isOpen={!!budgetToDelete}
                title="Delete Budget"
                message="Are you sure you want to delete this budget?"
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setBudgetToDelete(null)}
                isDestructive
            />
        </div>
    );
}
