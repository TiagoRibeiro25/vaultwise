import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) =>
                eq(users.email, session.user.email as string),
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { id: budgetId } = await params;

        const budget = await db.query.budgets.findFirst({
            where: and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)),
            with: {
                category: true,
            },
        });

        if (!budget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) =>
                eq(users.email, session.user.email as string),
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { id: budgetId } = await params;
        const body = await req.json();
        const { amount } = body;

        if (amount === undefined) {
            return NextResponse.json(
                { error: "Missing amount field" },
                { status: 400 },
            );
        }

        const existingBudget = await db.query.budgets.findFirst({
            where: and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)),
        });

        if (!existingBudget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 },
            );
        }

        const updatedBudget = await db
            .update(budgets)
            .set({
                amount: amount.toString(),
                updatedAt: new Date(),
            })
            .where(and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)))
            .returning();

        return NextResponse.json(updatedBudget[0]);
    } catch (error) {
        console.error("Error updating budget:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) =>
                eq(users.email, session.user.email as string),
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { id: budgetId } = await params;

        const existingBudget = await db.query.budgets.findFirst({
            where: and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)),
        });

        if (!existingBudget) {
            return NextResponse.json(
                { error: "Budget not found" },
                { status: 404 },
            );
        }

        await db
            .delete(budgets)
            .where(and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)));

        return NextResponse.json({ message: "Budget deleted successfully" });
    } catch (error) {
        console.error("Error deleting budget:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
