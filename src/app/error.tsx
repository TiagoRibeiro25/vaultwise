"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 rounded-full bg-red-50 p-4 dark:bg-red-500/10">
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    Something went wrong!
                </h2>

                <div className="flex w-full flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
                    >
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
