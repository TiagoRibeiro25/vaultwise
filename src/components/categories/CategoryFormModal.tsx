"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Category {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    isDefault: boolean;
}

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categoryToEdit?: Category | null;
}

const PRESET_COLORS = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#eab308", // Yellow
    "#84cc16", // Lime
    "#22c55e", // Green
    "#10b981", // Emerald
    "#14b8a6", // Teal
    "#06b6d4", // Cyan
    "#0ea5e9", // Sky
    "#3b82f6", // Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#a855f7", // Purple
    "#d946ef", // Fuchsia
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#64748b", // Slate
];

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSuccess,
    categoryToEdit,
}: CategoryFormModalProps) {
    const [name, setName] = useState<string>("");
    const [color, setColor] = useState<string>(PRESET_COLORS[11]); // Default Indigo
    const [icon, setIcon] = useState<string>("");

    // Track previous props to update state when modal opens or category changes
    const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);
    const [prevCategoryToEdit, setPrevCategoryToEdit] = useState<
        Category | null | undefined
    >(undefined);

    const {
        execute: saveCategory,
        isLoading,
        error,
    } = useApi({
        url: categoryToEdit
            ? `/api/categories/${categoryToEdit.id}`
            : "/api/categories",
        method: categoryToEdit ? "PUT" : "POST",
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    if (isOpen !== prevIsOpen || categoryToEdit !== prevCategoryToEdit) {
        setPrevIsOpen(isOpen);
        setPrevCategoryToEdit(categoryToEdit);

        if (isOpen) {
            if (categoryToEdit) {
                setName(categoryToEdit.name);
                setColor(categoryToEdit.color || PRESET_COLORS[11]);
                setIcon(categoryToEdit.icon || "");
            } else {
                setName("");
                setColor(PRESET_COLORS[11]);
                setIcon("");
            }
        }
    }

    if (!isOpen) return null;

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        await saveCategory({
            name,
            color,
            icon: icon || null,
        });
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:border dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
                        {categoryToEdit ? "Edit Category" : "New Category"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form
                        id="category-form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2"
                            >
                                Category Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                placeholder="E.g., Groceries, Entertainment"
                            />
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-3">
                                Theme Color
                            </label>
                            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                                {PRESET_COLORS.map((presetColor) => (
                                    <button
                                        key={presetColor}
                                        type="button"
                                        onClick={() => setColor(presetColor)}
                                        className="relative flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-110 cursor-pointer"
                                        style={{ backgroundColor: presetColor }}
                                    >
                                        <span className="sr-only">
                                            Color {presetColor}
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
                        form="category-form"
                        disabled={
                            isLoading || categoryToEdit?.isDefault === true
                        }
                        className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900 cursor-pointer"
                    >
                        {isLoading ? "Saving..." : "Save Category"}
                    </button>
                </div>
            </div>
        </div>
    );
}
