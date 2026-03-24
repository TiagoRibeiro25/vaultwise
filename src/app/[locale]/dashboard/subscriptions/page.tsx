import SubscriptionsClient from "@/components/subscriptions/SubscriptionsClient"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  return <SubscriptionsClient />
}
