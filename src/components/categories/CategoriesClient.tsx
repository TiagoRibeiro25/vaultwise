"use client"

import ConfirmModal from "@/components/ui/ConfirmModal"
import { useApi } from "@/hooks/useApi"
import { Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import CategoryFormModal from "./CategoryFormModal"

interface Category {
  id: string
  name: string
  color: string | null
  icon: string | null
  isDefault: boolean
}

export default function CategoriesClient() {
  const t = useTranslations("Categories")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const {
    data: categories,
    execute: fetchCategories,
    isLoading,
  } = useApi<Category[]>({
    url: "/api/categories",
  })

  const { execute: deleteCategory } = useApi({
    url: "/api/categories",
    method: "DELETE",
    onSuccess: () => {
      fetchCategories()
    },
    onError: error => {
      toast.error(error || "Failed to delete category")
    },
  })

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id: string) => {
    setCategoryToDelete(id)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    await deleteCategory(undefined, `/api/categories/${categoryToDelete}`)
    setCategoryToDelete(null)
  }

  const handleEdit = (category: Category) => {
    if (category.isDefault) return
    setCategoryToEdit(category)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setCategoryToEdit(null)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {useTranslations("Categories")("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {useTranslations("Categories")("subtitle")}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Plus className="h-5 w-5" />
            {useTranslations("Categories")("addCategory")}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Loading categories...
        </div>
      ) : categories?.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3 rounded-full bg-slate-50 p-3 dark:bg-slate-800">
              <Tag className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              No categories found.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Get started by creating a new category.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories?.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full shadow-sm ring-1 ring-black/5"
                  style={{
                    backgroundColor: category.color || "#cbd5e1",
                  }}
                />
                <span className="font-medium text-slate-900 dark:text-white">
                  {category.name}
                </span>
                {category.isDefault && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    System
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {category.isDefault ? (
                  <Lock
                    className="mx-2 h-4 w-4 text-slate-300 dark:text-slate-600"
                    aria-label="System category, cannot be modified"
                  />
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(category)}
                      className="cursor-pointer rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                      title={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t("edit")}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="cursor-pointer rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("delete")}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        categoryToEdit={categoryToEdit}
      />

      <ConfirmModal
        isOpen={!!categoryToDelete}
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        confirmText={t("delete")}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isDestructive
      />
    </div>
  )
}
