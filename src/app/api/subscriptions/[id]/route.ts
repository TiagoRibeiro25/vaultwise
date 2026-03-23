import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const subscription = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.id, id),
                eq(subscriptions.userId, session.user.id),
            ),
            with: {
                category: true,
            },
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(subscription);
    } catch (error) {
        console.error("Error fetching subscription:", error);
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
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const body = await req.json();
        const {
            name,
            amount,
            billingCycle,
            nextBillingDate,
            categoryId,
            status,
        } = body;

        const existingSubscription = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.id, id),
                eq(subscriptions.userId, session.user.id),
            ),
        });

        if (!existingSubscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 },
            );
        }

        const updateData: Record<string, string | Date | null> = {
            updatedAt: new Date(),
        };
        if (name) updateData.name = name;
        if (amount !== undefined) updateData.amount = amount.toString();
        if (billingCycle) updateData.billingCycle = billingCycle;
        if (nextBillingDate)
            updateData.nextBillingDate = new Date(nextBillingDate);
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (status) updateData.status = status;

        const updatedSubscription = await db
            .update(subscriptions)
            .set(updateData)
            .where(
                and(
                    eq(subscriptions.id, id),
                    eq(subscriptions.userId, session.user.id),
                ),
            )
            .returning();

        return NextResponse.json(updatedSubscription[0]);
    } catch (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const existingSubscription = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.id, id),
                eq(subscriptions.userId, session.user.id),
            ),
        });

        if (!existingSubscription) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 },
            );
        }

        await db
            .delete(subscriptions)
            .where(
                and(
                    eq(subscriptions.id, id),
                    eq(subscriptions.userId, session.user.id),
                ),
            );

        return NextResponse.json({
            message: "Subscription deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
