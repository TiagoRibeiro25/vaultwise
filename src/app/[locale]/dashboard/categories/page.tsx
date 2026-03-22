import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CategoriesClient from "@/components/categories/CategoriesClient";

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    return <CategoriesClient />;
}
