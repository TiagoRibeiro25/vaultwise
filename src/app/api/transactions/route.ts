import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userTransactions = await db.query.transactions.findMany({
            where: eq(transactions.userId, session.user.id),
            orderBy: [desc(transactions.date)],
            with: {
                category: true,
            },
        });

        return NextResponse.json(userTransactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { message: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, type, description, date, categoryId } = body;

        if (!amount || !type || !date) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const [newTransaction] = await db
            .insert(transactions)
            .values({
                userId: session.user.id,
                amount: amount.toString(),
                type,
                description: description || null,
                date: new Date(date),
                categoryId: categoryId || null,
            })
            .returning();

        return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { message: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
