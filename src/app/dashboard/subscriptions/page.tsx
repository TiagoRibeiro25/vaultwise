import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionsClient from "@/components/subscriptions/SubscriptionsClient";

export default async function SubscriptionsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <SubscriptionsClient />;
}
