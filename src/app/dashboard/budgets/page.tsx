import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BudgetsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Budgets
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Set monthly limits by category and track your progress.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Budgets Module
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        This page is currently a placeholder. Soon you will be able to define monthly budgets per category and view visual progress bars and alerts when approaching your spending limits.
                    </p>
                </div>
            </div>
        </div>
    );
}
