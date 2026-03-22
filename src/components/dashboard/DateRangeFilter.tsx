"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentRange = searchParams.get("range") || "all";

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams],
    );

    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(
            pathname + "?" + createQueryString("range", e.target.value),
        );
        router.refresh();
    };

    return (
        <div className="flex items-center space-x-2">
            <label
                htmlFor="range-filter"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
                View:
            </label>
            <select
                key={currentRange}
                id="range-filter"
                defaultValue={currentRange}
                onChange={handleRangeChange}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
            >
                <option value="month">This Month</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
            </select>
        </div>
    );
}
