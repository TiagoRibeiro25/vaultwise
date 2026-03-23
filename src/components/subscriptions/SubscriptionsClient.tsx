"use client";

import { formatCurrency } from "@/utils/currency";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useApi } from "@/hooks/useApi";
import { differenceInDays, format } from "date-fns";
import { enUS, pt } from "date-fns/locale";
import {
    Activity,
    Calendar,
    CheckCircle,
    CreditCard,
    Edit2,
    Plus,
    Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import SubscriptionFormModal from "./SubscriptionFormModal";

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
    const t = useTranslations("Subscriptions");
    const locale = useLocale();
    const dateLocale = locale === "pt" ? pt : enUS;

    const {
        data: subscriptions,
        execute: fetchSubscriptions,
        isLoading,
    } = useApi<Subscription[]>({
        url: "/api/subscriptions",
    });

    const { execute: deleteSubscription, isLoading: isDeleting } = useApi({
        url: "/api/subscriptions",
        method: "DELETE",
    });

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<
        string | null
    >(null);
    const [subscriptionToLog, setSubscriptionToLog] =
        useState<Subscription | null>(null);

    useEffect(() => {
        fetchSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = (sub?: Subscription) => {
        setEditingSub(sub || null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setSubscriptionToDelete(id);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete) return;

        const result = (await deleteSubscription(
            undefined,
            `/api/subscriptions/${subscriptionToDelete}`,
        )) as {
            error?: string;
        } | null;
        if (!result?.error) {
            fetchSubscriptions();
        }
        setSubscriptionToDelete(null);
    };

    const handleLogPayment = async (sub: Subscription) => {
        setSubscriptionToLog(sub);
    };

    const confirmLogPayment = async () => {
        if (!subscriptionToLog) return;
        const sub = subscriptionToLog;

        try {
            const txRes = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: sub.amount,
                    type: "expense",
                    description: sub.name,
                    date: new Date().toISOString(),
                    categoryId: sub.categoryId,
                }),
            });

            if (!txRes.ok) throw new Error("Failed to log transaction");

            const currentBillingDate = new Date(sub.nextBillingDate);
            const nextDate = new Date(currentBillingDate);
            if (sub.billingCycle === "monthly") {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }

            const subRes = await fetch(`/api/subscriptions/${sub.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nextBillingDate: nextDate.toISOString(),
                }),
            });

            if (!subRes.ok) throw new Error("Failed to update subscription");

            fetchSubscriptions();
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while logging the payment.");
        } finally {
            setSubscriptionToLog(null);
        }
    };

    const { monthlyTotal, yearlyTotal, activeCount } = useMemo(() => {
        if (!subscriptions) {
            return { monthlyTotal: 0, yearlyTotal: 0, activeCount: 0 };
        }

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
                        {useTranslations("Subscriptions")("title")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {useTranslations("Subscriptions")("subtitle")}
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        {useTranslations("Subscriptions")("addSubscription")}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t("monthlyCost")}
                        </h3>
                        <div className="rounded-full bg-red-50 p-2 dark:bg-red-500/10">
                            <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(monthlyTotal)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("estimatedAverage")}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t("yearlyCost")}
                        </h3>
                        <div className="rounded-full bg-orange-50 p-2 dark:bg-orange-500/10">
                            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(yearlyTotal)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("totalSpentYear")}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {t("activeSubscriptions")}
                        </h3>
                        <div className="rounded-full bg-indigo-50 p-2 dark:bg-indigo-500/10">
                            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {activeCount}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("outOfTotal", { total: subscriptions?.length || 0 })}
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
                            {t("noSubscriptionsYet")}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            {t("keepTrack")}
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {t("addFirst")}
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
                                                    t("uncategorized")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {sub.status === "paused" && (
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {t("paused")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(Number(sub.amount))}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {sub.billingCycle === "monthly"
                                                ? t("perMonth")
                                                : t("perYear")}
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
                                                { locale: dateLocale },
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
                                                        ? t("today")
                                                        : daysLeft === 1
                                                          ? t("inOneDay")
                                                          : t("inDays", {
                                                                days: daysLeft,
                                                            })}
                                                </span>
                                            )}
                                        {daysLeft < 0 &&
                                            sub.status === "active" && (
                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                    {t("pastDue")}
                                                </span>
                                            )}
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 flex opacity-0 transition-opacity group-hover:opacity-100">
                                    {/* Action buttons appear on hover, but we'll keep them always visible for touch devices by placing them at the bottom in mobile */}
                                </div>
                                <div className="mt-4 flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => handleLogPayment(sub)}
                                        disabled={sub.status === "paused"}
                                        className="w-full inline-flex justify-center items-center rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        {t("logPayment")}
                                    </button>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleOpenModal(sub)}
                                            className="flex-1 inline-flex justify-center items-center rounded-md bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        >
                                            <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                            {t("edit")}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            disabled={isDeleting}
                                            className="inline-flex justify-center items-center rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SubscriptionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchSubscriptions()}
                subscriptionToEdit={editingSub}
            />

            <ConfirmModal
                isOpen={!!subscriptionToDelete}
                title={t("deleteTitle")}
                message={t("deleteMessage")}
                confirmText={t("delete")}
                onConfirm={confirmDelete}
                onCancel={() => setSubscriptionToDelete(null)}
                isDestructive
            />

            <ConfirmModal
                isOpen={!!subscriptionToLog}
                title={t("logPayment")}
                message={t("logPaymentMessage")}
                confirmText={t("logPayment")}
                onConfirm={confirmLogPayment}
                onCancel={() => setSubscriptionToLog(null)}
            />
        </div>
    );
}
