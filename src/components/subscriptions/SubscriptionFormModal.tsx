"use client"

import { useApi } from "@/hooks/useApi"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import toast from "react-hot-toast"

interface Category {
  id: string
  name: string
  color?: string | null
  icon?: string | null
}

interface Subscription {
  id: string
  categoryId: string | null
  name: string
  amount: string
  billingCycle: "monthly" | "yearly"
  nextBillingDate: string
  status: "active" | "paused"
  category?: Category | null
}

interface SubscriptionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subscriptionToEdit?: Subscription | null
}

export default function SubscriptionFormModal({
  isOpen,
  onClose,
  onSuccess,
  subscriptionToEdit,
}: SubscriptionFormModalProps) {
  const t = useTranslations("Subscriptions")
  const tCommon = useTranslations("Common")
  const tTrans = useTranslations("Transactions")
  const [name, setName] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [nextBillingDate, setNextBillingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [categoryId, setCategoryId] = useState<string>("")
  const [status, setStatus] = useState<"active" | "paused">("active")

  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false)
  const [prevSubscriptionToEdit, setPrevSubscriptionToEdit] = useState<
    Subscription | null | undefined
  >(undefined)

  const { data: categories, execute: fetchCategories } = useApi<Category[]>({
    url: "/api/categories",
  })

  const {
    execute: saveSubscription,
    isLoading,
    error,
  } = useApi({
    url: subscriptionToEdit
      ? `/api/subscriptions/${subscriptionToEdit.id}`
      : "/api/subscriptions",
    method: subscriptionToEdit ? "PUT" : "POST",
    onSuccess: () => {
      onSuccess()
      onClose()
    },
  })

  if (isOpen !== prevIsOpen || subscriptionToEdit !== prevSubscriptionToEdit) {
    setPrevIsOpen(isOpen)
    setPrevSubscriptionToEdit(subscriptionToEdit)

    if (isOpen) {
      fetchCategories()
      if (subscriptionToEdit) {
        setName(subscriptionToEdit.name)
        setAmount(subscriptionToEdit.amount)
        setBillingCycle(subscriptionToEdit.billingCycle)
        setNextBillingDate(
          new Date(subscriptionToEdit.nextBillingDate).toISOString().split("T")[0]
        )
        setCategoryId(subscriptionToEdit.categoryId || "")
        setStatus(subscriptionToEdit.status)
      } else {
        setName("")
        setAmount("")
        setBillingCycle("monthly")
        setNextBillingDate(new Date().toISOString().split("T")[0])
        setCategoryId("")
        setStatus("active")
      }
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name || !amount || !nextBillingDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    await saveSubscription({
      name,
      amount: Number(amount),
      billingCycle,
      nextBillingDate,
      categoryId: categoryId || null,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white text-left shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {subscriptionToEdit ? t("editSubscription") : t("newSubscription")}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="subscription-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("name")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="e.g. Netflix, Gym"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("amount")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500">€</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("billingCycle")}
                </label>
                <select
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value as "monthly" | "yearly")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="monthly">{t("monthly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("nextBillingDate")}
              </label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={e => setNextBillingDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:scheme-dark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {tTrans("category")}
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">None</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("status")}
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as "active" | "paused")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="active">{t("active")}</option>
                  <option value="paused">{t("paused")}</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            form="subscription-form"
            disabled={isLoading}
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:hover:bg-indigo-500"
          >
            {isLoading ? t("saving") : t("saveSubscription")}
          </button>
        </div>
      </div>
    </div>
  )
}
