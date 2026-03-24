"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  const t = useTranslations("Common")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex flex-1 cursor-pointer justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            {cancelText || t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex flex-1 cursor-pointer justify-center rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:hover:bg-red-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:hover:bg-indigo-500"
            }`}
          >
            {confirmText || t("submit")}
          </button>
        </div>
      </div>
    </div>
  )
}
