import MobileNav from "@/components/layout/MobileNav"
import Sidebar from "@/components/layout/Sidebar"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = {
    name: session.user?.name,
    email: session.user?.email,
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar user={user} />

      <main className="flex h-screen w-full flex-1 flex-col overflow-y-auto">
        <MobileNav user={user} />

        <div className="flex-1 p-4 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
