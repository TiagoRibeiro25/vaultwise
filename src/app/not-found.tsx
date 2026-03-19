import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 rounded-full bg-indigo-50 p-4 dark:bg-indigo-500/10">
                    <FileQuestion className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </div>

                <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Page Not Found
                </h2>

                <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
                    We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
                </p>

                <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                    <Home className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
