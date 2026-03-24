"use client"

import { useApi } from "@/hooks/useApi"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import toast from "react-hot-toast"

type Category = {
  id: string
  name: string
  color: string
  icon: string
}

type Budget = {
  id: string
  categoryId: string
  amount: string
  month: number
  year: number
  category?: Category
}

interface BudgetFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  budgetToEdit?: Budget | null
  currentMonth: number
  currentYear: number
}

export default function BudgetFormModal({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  currentMonth,
  currentYear,
}: BudgetFormModalProps) {
  const t = useTranslations("Budgets")
  const tCommon = useTranslations("Common")
  const tTrans = useTranslations("Transactions")
  const [categoryId, setCategoryId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false)
  const [prevBudgetToEdit, setPrevBudgetToEdit] = useState<Budget | null | undefined>(
    undefined
  )

  const { data: categories, execute: fetchCategories } = useApi<Category[]>({
    url: "/api/categories",
  })

  const {
    execute: saveBudget,
    isLoading,
    error,
  } = useApi({
    url: budgetToEdit ? `/api/budgets/${budgetToEdit.id}` : "/api/budgets",
    method: budgetToEdit ? "PUT" : "POST",
    onSuccess: () => {
      onSuccess()
      onClose()
    },
  })

  if (isOpen !== prevIsOpen || budgetToEdit !== prevBudgetToEdit) {
    setPrevIsOpen(isOpen)
    setPrevBudgetToEdit(budgetToEdit)

    if (isOpen) {
      fetchCategories()
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.categoryId)
        setAmount(budgetToEdit.amount)
      } else {
        setCategoryId("")
        setAmount("")
      }
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!categoryId) {
      toast.error(tTrans("selectCategory"))
      return
    }

    await saveBudget({
      categoryId,
      amount: parseFloat(amount),
      month: currentMonth,
      year: currentYear,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {budgetToEdit ? t("editBudget") : t("newBudget")}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("category")}
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              disabled={!!budgetToEdit}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            >
              <option value="" disabled>
                {tTrans("selectCategory")}
              </option>
              {(categories || []).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("amount")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-slate-500 dark:text-slate-400">€</span>
              </div>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              form="budget-form"
              disabled={isLoading}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:hover:bg-indigo-500"
            >
              {isLoading ? t("saving") : t("saveBudget")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
