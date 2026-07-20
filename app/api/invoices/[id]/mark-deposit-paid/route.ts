import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.depositPaid) {
      return NextResponse.json({ error: "Deposit already marked as paid" }, { status: 400 });
    }

    if (!invoice.depositPercent || invoice.depositPercent <= 0) {
      return NextResponse.json({ error: "This invoice has no deposit configured" }, { status: 400 });
    }

    const depositAmount = parseFloat((invoice.total * (invoice.depositPercent / 100)).toFixed(2));

    const receiptNumber = `${invoice.invoiceNumber}D`;

    // Create the deposit receipt and update the invoice atomically
    const [receipt, updatedInvoice] = await prisma.$transaction([
      prisma.receipt.create({
        data: {
          receiptNumber,
          userId: invoice.userId,
          amount: depositAmount,
          description: `Deposit payment (${invoice.depositPercent}%) for invoice ${invoice.invoiceNumber}`,
          paymentMethod: "Bank Transfer",
          date: new Date(),
        },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.invoice.update({
        where: { id },
        data: { depositPaid: true },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
    ]);

    return NextResponse.json({ invoice: updatedInvoice, receipt });
  } catch (error) {
    console.error("Error marking deposit paid:", error);
    return NextResponse.json({ error: "Failed to mark deposit as paid" }, { status: 500 });
  }
}
