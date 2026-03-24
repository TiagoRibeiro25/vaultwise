import { db } from "@/db"
import { transactions } from "@/db/schema"
import { authOptions } from "@/lib/auth"
import { endOfMonth, startOfMonth } from "date-fns"
import { and, desc, eq, gte, lte } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    const conditions = [eq(transactions.userId, session.user.id)]

    if (monthParam && yearParam) {
      const year = parseInt(yearParam)
      const month = parseInt(monthParam) - 1 // 0-indexed for Date

      const startDate = startOfMonth(new Date(year, month))
      const endDate = endOfMonth(new Date(year, month))

      conditions.push(gte(transactions.date, startDate))
      conditions.push(lte(transactions.date, endDate))
    }

    const userTransactions = await db.query.transactions.findMany({
      where: and(...conditions),
      orderBy: [desc(transactions.date)],
      with: {
        category: true,
      },
    })

    return NextResponse.json(userTransactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ message: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, type, description, date, categoryId } = body

    if (!amount || !type || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
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
      .returning()

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ message: "Failed to create transaction" }, { status: 500 })
  }
}
