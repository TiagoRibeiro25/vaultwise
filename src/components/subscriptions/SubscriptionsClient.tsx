"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Calendar,
    CreditCard,
    Activity,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useApi } from "@/hooks/useApi";

interface Category {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
}

interface Subscription {
    id: string;
    categoryId: string | null;
    name: string;
    amount: string;
    billingCycle: "monthly" | "yearly";
    nextBillingDate: string;
    status: "active" | "paused";
    category?: Category | null;
}

export default function SubscriptionsClient() {
    const {
        data: subscriptions,
        execute: fetchSubscriptions,
        isLoading,
    } = useApi<Subscription[]>({
        url: "/api/subscriptions",
    });

    const { data: categories, execute: fetchCategories } = useApi<Category[]>({
        url: "/api/categories",
    });

    const { execute: deleteSubscription, isLoading: isDeleting } = useApi({
        url: "/api/subscriptions",
        method: "DELETE",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
        "monthly",
    );
    const [nextBillingDate, setNextBillingDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState<"active" | "paused">("active");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const { execute: saveSubscription } = useApi({
        url: "/api/subscriptions",
        method: editingSub ? "PUT" : "POST",
    });

    useEffect(() => {
        fetchSubscriptions();
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = (sub?: Subscription) => {
        if (sub) {
            setEditingSub(sub);
            setName(sub.name);
            setAmount(sub.amount);
            setBillingCycle(sub.billingCycle);
            setNextBillingDate(
                new Date(sub.nextBillingDate).toISOString().split("T")[0],
            );
            setCategoryId(sub.categoryId || "");
            setStatus(sub.status);
        } else {
            setEditingSub(null);
            setName("");
            setAmount("");
            setBillingCycle("monthly");
            setNextBillingDate(new Date().toISOString().split("T")[0]);
            setCategoryId("");
            setStatus("active");
        }
        setFormError("");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");

        if (!name || !amount || !nextBillingDate) {
            setFormError("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            name,
            amount: Number(amount),
            billingCycle,
            nextBillingDate,
            categoryId: categoryId || null,
            status,
        };

        const result = (await saveSubscription(
            payload,
            editingSub ? `/api/subscriptions/${editingSub.id}` : undefined,
        )) as { error?: string } | null;

        if (result?.error) {
            setFormError(result.error);
        } else {
            fetchSubscriptions();
            handleCloseModal();
        }

        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this subscription?",
            )
        ) {
            return;
        }

        const result = (await deleteSubscription(
            undefined,
            `/api/subscriptions/${id}`,
        )) as {
            error?: string;
        } | null;
        if (!result?.error) {
            fetchSubscriptions();
        }
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR",
        }).format(Number(val));
    };

    const { monthlyTotal, yearlyTotal, activeCount } = useMemo(() => {
        if (!subscriptions)
            return { monthlyTotal: 0, yearlyTotal: 0, activeCount: 0 };

        let monthly = 0;
        let yearly = 0;
        let active = 0;

        subscriptions.forEach((sub) => {
            if (sub.status === "active") {
                active++;
                const amt = Number(sub.amount);
                if (sub.billingCycle === "monthly") {
                    monthly += amt;
                    yearly += amt * 12;
                } else {
                    yearly += amt;
                    monthly += amt / 12;
                }
            }
        });

        return {
            monthlyTotal: monthly,
            yearlyTotal: yearly,
            activeCount: active,
        };
    }, [subscriptions]);

    const getDaysUntilBilling = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const billingDate = new Date(dateString);
        billingDate.setHours(0, 0, 0, 0);

        // If billing date is in the past, calculate next occurrence
        if (billingDate < today) {
            return -1; // Flag to indicate needs update
        }

        return differenceInDays(billingDate, today);
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Subscriptions
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Manage your recurring payments and track your fixed
                        costs.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                        <Plus className="h-5 w-5" />
                        Add Subscription
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Monthly Cost
                        </h3>
                        <div className="rounded-full bg-red-50 p-2 dark:bg-red-500/10">
                            <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(monthlyTotal)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Estimated average per month
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Yearly Cost
                        </h3>
                        <div className="rounded-full bg-orange-50 p-2 dark:bg-orange-500/10">
                            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(yearlyTotal)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Total spent in a year
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Active Subscriptions
                        </h3>
                        <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-500/10">
                            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {activeCount}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Out of {subscriptions?.length || 0} total
                    </p>
                </div>
            </div>

            {/* Subscriptions Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                </div>
            ) : !subscriptions || subscriptions.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-slate-50 p-4 dark:bg-slate-800 mb-4">
                            <CreditCard className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            No subscriptions yet
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            Keep track of your recurring expenses like Netflix,
                            Gym, or Spotify by adding them here.
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add your first subscription
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {subscriptions.map((sub) => {
                        const daysLeft = getDaysUntilBilling(
                            sub.nextBillingDate,
                        );

                        return (
                            <div
                                key={sub.id}
                                className={`relative flex flex-col rounded-xl border ${
                                    sub.status === "paused"
                                        ? "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-75"
                                        : "border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
                                } p-6`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-lg shadow-sm"
                                            style={{
                                                backgroundColor:
                                                    sub.category?.color ||
                                                    (sub.status === "paused"
                                                        ? "#94a3b8"
                                                        : "#6366f1"),
                                            }}
                                        >
                                            {sub.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                {sub.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {sub.category?.name ||
                                                    "Uncategorized"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {sub.status === "paused" && (
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                Paused
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(sub.amount)}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            per{" "}
                                            {sub.billingCycle === "monthly"
                                                ? "month"
                                                : "year"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                                            <Calendar className="mr-1.5 h-4 w-4" />
                                            {format(
                                                new Date(sub.nextBillingDate),
                                                "MMM dd, yyyy",
                                            )}
                                        </div>
                                        {sub.status === "active" &&
                                            daysLeft >= 0 && (
                                                <span
                                                    className={`font-medium ${
                                                        daysLeft <= 3
                                                            ? "text-red-600 dark:text-red-400"
                                                            : daysLeft <= 7
                                                              ? "text-orange-500 dark:text-orange-400"
                                                              : "text-emerald-600 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {daysLeft === 0
                                                        ? "Today"
                                                        : `In ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`}
                                                </span>
                                            )}
                                        {daysLeft < 0 &&
                                            sub.status === "active" && (
                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                    Past due
                                                </span>
                                            )}
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 flex opacity-0 transition-opacity group-hover:opacity-100">
                                    {/* Action buttons appear on hover, but we'll keep them always visible for touch devices by placing them at the bottom in mobile */}
                                </div>
                                <div className="mt-4 flex gap-2 w-full">
                                    <button
                                        onClick={() => handleOpenModal(sub)}
                                        className="flex-1 inline-flex justify-center items-center rounded-md bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        disabled={isDeleting}
                                        className="inline-flex justify-center items-center rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseModal}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white text-left shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingSub
                                    ? "Edit Subscription"
                                    : "Add Subscription"}
                            </h3>
                        </div>

                        <div className="p-6">
                            <form
                                id="subscription-form"
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {formError && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        {formError}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="e.g. Netflix, Gym"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Amount
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-slate-500">
                                                    €
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) =>
                                                    setAmount(e.target.value)
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Cycle
                                        </label>
                                        <select
                                            value={billingCycle}
                                            onChange={(e) =>
                                                setBillingCycle(
                                                    e.target.value as
                                                        | "monthly"
                                                        | "yearly",
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        >
                                            <option value="monthly">
                                                Monthly
                                            </option>
                                            <option value="yearly">
                                                Yearly
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Next Billing Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={nextBillingDate}
                                        onChange={(e) =>
                                            setNextBillingDate(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:scheme-dark"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Category
                                        </label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) =>
                                                setCategoryId(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        >
                                            <option value="">None</option>
                                            {categories?.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) =>
                                                setStatus(
                                                    e.target.value as
                                                        | "active"
                                                        | "paused",
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        >
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="paused">
                                                Paused
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-3 dark:border-slate-800 dark:bg-slate-900/50">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="subscription-form"
                                disabled={isSubmitting}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-500"
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : "Save Subscription"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
