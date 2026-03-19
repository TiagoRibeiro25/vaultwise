import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userSubscriptions = await db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, session.user.id),
            orderBy: (subscriptions, { asc }) => [
                asc(subscriptions.nextBillingDate),
            ],
            with: {
                category: true,
            },
        });

        return NextResponse.json(userSubscriptions);
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const {
            name,
            amount,
            billingCycle,
            nextBillingDate,
            categoryId,
            status,
        } = body;

        if (
            !name ||
            amount === undefined ||
            !billingCycle ||
            !nextBillingDate
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const newSubscription = await db
            .insert(subscriptions)
            .values({
                userId: session.user.id,
                categoryId: categoryId || null,
                name,
                amount: amount.toString(),
                billingCycle,
                nextBillingDate: new Date(nextBillingDate),
                status: status || "active",
            })
            .returning();

        return NextResponse.json(newSubscription[0], { status: 201 });
    } catch (error) {
        console.error("Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
