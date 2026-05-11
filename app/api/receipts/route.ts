import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let receipts;
    
    if (session.user.role === "ADMIN") {
      receipts = await prisma.receipt.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      receipts = await prisma.receipt.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, receiptNumber, amount, description, paymentMethod, date } = body;

    if (!userId || !receiptNumber || !amount || !description || !date) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if receipt number already exists
    const existingReceipt = await prisma.receipt.findUnique({
      where: { receiptNumber },
    });

    if (existingReceipt) {
      return NextResponse.json(
        { error: "Receipt number already exists" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        receiptNumber,
        amount: parseFloat(amount),
        description,
        paymentMethod: paymentMethod || "Bank Transfer",
        date: new Date(date),
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
