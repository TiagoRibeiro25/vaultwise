import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = {
        name: session.user?.name,
        email: session.user?.email,
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
                <MobileNav user={user} />

                <div className="flex-1 p-4 sm:p-8">{children}</div>
            </main>
        </div>
    );
}
