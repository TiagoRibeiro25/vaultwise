import { db } from "@/db"
import { transactions } from "@/db/schema"
import { authOptions } from "@/lib/auth"
import { and, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const body = await req.json()
    const { amount, type, description, date, categoryId } = body

    if (!amount || !type || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        amount: amount.toString(),
        type,
        description: description || null,
        date: new Date(date),
        categoryId: categoryId || null,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
      .returning()

    if (!updatedTransaction) {
      return NextResponse.json(
        { message: "Transaction not found or not authorized" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ message: "Failed to update transaction" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const [deletedTransaction] = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
      .returning()

    if (!deletedTransaction) {
      return NextResponse.json(
        { message: "Transaction not found or not authorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 })
  }
}
