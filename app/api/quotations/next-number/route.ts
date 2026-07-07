import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latestQuotation = await prisma.quotation.findFirst({
      orderBy: { createdAt: "desc" },
      select: { quoteNumber: true },
    });

    let nextNumber = 1000; // Starting number

    if (latestQuotation && latestQuotation.quoteNumber) {
      const match = latestQuotation.quoteNumber.match(/QUO-(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        nextNumber = currentNumber + 1;
      }
    }

    const formattedNumber = `QUO-${String(nextNumber).padStart(5, '0')}`;

    return NextResponse.json({ quoteNumber: formattedNumber });
  } catch (error) {
    console.error("Error generating quote number:", error);
    return NextResponse.json({ error: "Failed to generate quote number" }, { status: 500 });
  }
}
