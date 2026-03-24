import { db } from "@/db"
import { categories } from "@/db/schema"
import { authOptions } from "@/lib/auth"
import { eq, or } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userCategories = await db.query.categories.findMany({
      where: or(eq(categories.userId, session.user.id), eq(categories.isDefault, true)),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    })

    return NextResponse.json(userCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, color, icon } = body

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 })
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        userId: session.user.id,
        name,
        color: color || null,
        icon: icon || null,
        isDefault: false,
      })
      .returning()

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 })
  }
}
