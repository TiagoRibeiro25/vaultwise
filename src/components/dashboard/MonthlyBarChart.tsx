"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

interface Transaction {
    amount: string | number;
    type: "income" | "expense";
    date: string | Date;
}

interface MonthlyBarChartProps {
    transactions: Transaction[];
}

interface CustomTooltipProps {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
                <p className="mb-2 font-medium text-slate-900 dark:text-slate-100">
                    {label}
                </p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {payload.map((entry: any, index: number) => (
                    <div
                        key={index}
                        className="mb-1 flex items-center justify-between gap-6 text-sm last:mb-0"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize text-slate-600 dark:text-slate-400">
                                {entry.name}
                            </span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {new Intl.NumberFormat("pt-PT", {
                                style: "currency",
                                currency: "EUR",
                            }).format(entry.value || 0)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function MonthlyBarChart({
    transactions,
}: MonthlyBarChartProps) {
    const data = useMemo(() => {
        // Generate the last 6 months
        const months = Array.from({ length: 6 }).map((_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return startOfMonth(d);
        });

        // Calculate income and expenses for each month
        return months.map((month) => {
            const monthTransactions = transactions.filter((t) =>
                isSameMonth(new Date(t.date), month),
            );

            const income = monthTransactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expense = monthTransactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return {
                name: format(month, "MMM"),
                Income: income,
                Expense: expense,
            };
        });
    }, [transactions]);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 5,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                        className="dark:opacity-10"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value) =>
                            value >= 1000 ? `€${value / 1000}k` : `€${value}`
                        }
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                    />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
                    />
                    <Bar
                        dataKey="Income"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                    <Bar
                        dataKey="Expense"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
