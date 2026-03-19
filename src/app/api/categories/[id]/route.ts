import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        const body = await req.json();
        const { name, color, icon } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Category name is required" },
                { status: 400 }
            );
        }

        const [updatedCategory] = await db
            .update(categories)
            .set({
                name,
                color: color || null,
                icon: icon || null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(categories.id, id),
                    eq(categories.userId, session.user.id)
                )
            )
            .returning();

        if (!updatedCategory) {
            return NextResponse.json(
                { message: "Category not found or not authorized to edit" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { message: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        const [deletedCategory] = await db
            .delete(categories)
            .where(
                and(
                    eq(categories.id, id),
                    eq(categories.userId, session.user.id)
                )
            )
            .returning();

        if (!deletedCategory) {
            return NextResponse.json(
                { message: "Category not found or not authorized to delete" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { message: "Failed to delete category" },
            { status: 500 }
        );
    }
}
