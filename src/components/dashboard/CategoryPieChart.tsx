"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface Category {
    id: string;
    name: string;
    color?: string | null;
}

interface Transaction {
    id: string;
    amount: string | number;
    type: "income" | "expense";
    categoryId: string | null;
    category?: Category | null;
}

interface CategoryPieChartProps {
    transactions: Transaction[];
}

// Fallback colors if a category doesn't have one
const COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#0ea5e9", // sky
];

interface CustomTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
                <div className="mb-1 flex items-center gap-2">
                    <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: data.color }}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                        {data.name}
                    </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {new Intl.NumberFormat("pt-PT", {
                        style: "currency",
                        currency: "EUR",
                    }).format(data.value)}
                </p>
            </div>
        );
    }
    return null;
};

export default function CategoryPieChart({
    transactions,
}: CategoryPieChartProps) {
    const data = useMemo(() => {
        // We only want to chart expenses
        const expenses = transactions.filter((t) => t.type === "expense");

        // Group expenses by category name
        const grouped = expenses.reduce(
            (acc, curr) => {
                const catName = curr.category?.name || "Uncategorized";
                const amount = Number(curr.amount);

                if (!acc[catName]) {
                    acc[catName] = {
                        name: catName,
                        value: 0,
                        color: curr.category?.color || null,
                    };
                }
                acc[catName].value += amount;
                return acc;
            },
            {} as Record<
                string,
                { name: string; value: number; color: string | null }
            >,
        );

        // Sort by value descending and assign fallback colors if missing
        return Object.values(grouped)
            .sort((a, b) => b.value - a.value)
            .map((item, index) => ({
                ...item,
                color: item.color || COLORS[index % COLORS.length],
            }));
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="flex h-80 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/20">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No expense data available for this period.
                </p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color as string}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: "13px" }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
