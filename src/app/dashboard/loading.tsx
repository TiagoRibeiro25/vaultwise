export default function DashboardLoading() {
    return (
        <div className="space-y-6 w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                    <div className="mt-2 h-4 w-64 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                </div>
                <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                        <div className="mt-4 h-8 w-32 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                ))}
            </div>

            {/* Content Area Skeleton (Table/Chart placeholder) */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <div className="h-6 w-40 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                </div>
                <div className="p-6 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                                    <div className="h-3 w-24 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                                </div>
                            </div>
                            <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
