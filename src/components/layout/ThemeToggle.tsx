"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState<boolean>(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        // Return a placeholder of the same size to prevent layout shift
        return (
            <div className="flex w-full items-center justify-between rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50 h-9.5"></div>
        );
    }

    return (
        <div className="flex w-full items-center justify-between rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
            <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer ${
                    theme === "light"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Light Theme"
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
            </button>
            <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer ${
                    theme === "system"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="System Theme"
            >
                <Monitor className="h-4 w-4" />
                <span className="sr-only">System</span>
            </button>
            <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-1 items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer ${
                    theme === "dark"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Dark Theme"
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    );
}
