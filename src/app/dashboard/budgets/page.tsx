import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BudgetsClient from "@/components/budgets/BudgetsClient";

export default async function BudgetsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <BudgetsClient />;
}
