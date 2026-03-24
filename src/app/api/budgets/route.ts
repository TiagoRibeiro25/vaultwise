import { db } from "@/db"
import { budgets } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user id from db based on email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email as string),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get query params for month and year if provided
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    const conditions = [eq(budgets.userId, user.id)]

    if (monthParam) {
      conditions.push(eq(budgets.month, parseInt(monthParam)))
    }
    if (yearParam) {
      conditions.push(eq(budgets.year, parseInt(yearParam)))
    }

    const userBudgets = await db.query.budgets.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: (budgets, { desc }) => [desc(budgets.createdAt)],
    })

    return NextResponse.json(userBudgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email as string),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { categoryId, amount, month, year } = body

    if (!categoryId || amount === undefined || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if budget already exists for this category, month, and year
    const existingBudget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, user.id),
        eq(budgets.categoryId, categoryId),
        eq(budgets.month, month),
        eq(budgets.year, year)
      ),
    })

    if (existingBudget) {
      return NextResponse.json(
        {
          error:
            "A budget for this category and month already exists. Please update it instead.",
        },
        { status: 409 }
      )
    }

    const newBudget = await db
      .insert(budgets)
      .values({
        userId: user.id,
        categoryId,
        amount: amount.toString(),
        month,
        year,
      })
      .returning()

    return NextResponse.json(newBudget[0], { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
