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

    // Get the latest invoice number
    const latestInvoice = await prisma.invoice.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        invoiceNumber: true,
      },
    });

    let nextNumber = 1500; // Starting number

    if (latestInvoice && latestInvoice.invoiceNumber) {
      // Extract number from format INV-XXXXX
      const match = latestInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        nextNumber = currentNumber + 1;
      }
    }

    // Format with leading zeros (5 digits)
    const formattedNumber = `INV-${String(nextNumber).padStart(5, '0')}`;

    return NextResponse.json({ invoiceNumber: formattedNumber });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return NextResponse.json({ error: "Failed to generate invoice number" }, { status: 500 });
  }
}
