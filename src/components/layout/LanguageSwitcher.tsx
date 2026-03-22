"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const changeLanguage = (nextLocale: "en" | "pt") => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="flex w-full items-center justify-between rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
            <button
                type="button"
                onClick={() => changeLanguage("en")}
                disabled={isPending}
                className={`flex flex-1 items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                    locale === "en"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="English"
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => changeLanguage("pt")}
                disabled={isPending}
                className={`flex flex-1 items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                    locale === "pt"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Português"
            >
                PT
            </button>
        </div>
    );
}
