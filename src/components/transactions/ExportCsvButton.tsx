import { Download } from "lucide-react";
import type { FC } from "react";
import { Transaction } from "./TransactionsClient";
import { format } from "date-fns";

interface ExportCsvButtonProps {
    filteredTransactions: Transaction[] | null;
}

const ExportCsvButton: FC<ExportCsvButtonProps> = ({
    filteredTransactions,
}) => {
    const handleExportCSV = () => {
        if (!filteredTransactions || filteredTransactions.length === 0) {
            alert("No transactions to export.");
            return;
        }

        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const csvRows = [headers.join(",")];

        filteredTransactions.forEach((t) => {
            const date = format(new Date(t.date), "yyyy-MM-dd");
            const description = t.description
                ? `"${t.description.replace(/"/g, '""')}"`
                : "";
            const category = t.category?.name
                ? `"${t.category.name.replace(/"/g, '""')}"`
                : "";
            const type = t.type;
            const amount = t.amount;

            csvRows.push([date, description, category, type, amount].join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `transactions_export_${format(new Date(), "yyyy-MM-dd")}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 cursor-pointer"
        >
            <Download className="h-5 w-5" />
            Export
        </button>
    );
};

export default ExportCsvButton;
