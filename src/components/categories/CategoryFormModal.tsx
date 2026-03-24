"use client"

import { PRESET_COLORS } from "@/constants/colors"
import { useApi } from "@/hooks/useApi"
import { Check, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface Category {
  id: string
  name: string
  color: string | null
  icon: string | null
  isDefault: boolean
}

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categoryToEdit?: Category | null
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}: CategoryFormModalProps) {
  const t = useTranslations("Categories")
  const tCommon = useTranslations("Common")
  const [name, setName] = useState<string>("")
  const [color, setColor] = useState<string>(PRESET_COLORS[11]) // Default Indigo
  const [icon, setIcon] = useState<string>("")

  // Track previous props to update state when modal opens or category changes
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false)
  const [prevCategoryToEdit, setPrevCategoryToEdit] = useState<
    Category | null | undefined
  >(undefined)

  const {
    execute: saveCategory,
    isLoading,
    error,
  } = useApi({
    url: categoryToEdit ? `/api/categories/${categoryToEdit.id}` : "/api/categories",
    method: categoryToEdit ? "PUT" : "POST",
    onSuccess: () => {
      onSuccess()
      onClose()
    },
  })

  if (isOpen !== prevIsOpen || categoryToEdit !== prevCategoryToEdit) {
    setPrevIsOpen(isOpen)
    setPrevCategoryToEdit(categoryToEdit)

    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name)
        setColor(categoryToEdit.color || PRESET_COLORS[11])
        setIcon(categoryToEdit.icon || "")
      } else {
        setName("")
        setColor(PRESET_COLORS[11])
        setIcon("")
      }
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    await saveCategory({
      name,
      color,
      icon: icon || null,
    })
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg leading-6 font-semibold text-slate-900 dark:text-white">
            {categoryToEdit ? t("editCategory") : t("newCategory")}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm leading-6 font-medium text-slate-900 dark:text-slate-300"
              >
                {t("name")}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full rounded-lg border-0 px-3 py-2.5 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                placeholder="E.g., Groceries, Entertainment"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="mb-3 block text-sm leading-6 font-medium text-slate-900 dark:text-slate-300">
                {t("color")}
              </label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
                {PRESET_COLORS.map(presetColor => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                    style={{ backgroundColor: presetColor }}
                  >
                    <span className="sr-only">
                      {t("color")} {presetColor}
                    </span>
                    {color === presetColor && (
                      <Check className="h-4 w-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isLoading || categoryToEdit?.isDefault === true}
            className="inline-flex cursor-pointer justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900"
          >
            {isLoading ? t("saving") : t("saveCategory")}
          </button>
        </div>
      </div>
    </div>
  )
}
