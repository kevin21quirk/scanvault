import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Get the invoice first
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidDate: status === "PAID" ? new Date() : null,
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

    // If status is PAID, automatically generate a receipt
    let receipt = null;
    if (status === "PAID") {
      // Check if receipt already exists for this invoice (by matching receipt number)
      const existingReceipt = await prisma.receipt.findUnique({
        where: { receiptNumber: invoice.invoiceNumber },
      });

      if (!existingReceipt) {
        const receiptNumber = invoice.invoiceNumber;

        // Use the actual deposit receipt amount (source of truth) rather than recalculating
        const depositReceipt = invoice.depositPaid
          ? await prisma.receipt.findUnique({ where: { receiptNumber: `${invoice.invoiceNumber}D` } })
          : null;
        const depositAmount = depositReceipt ? depositReceipt.amount : 0;
        const depositPct = invoice.depositPercent ?? 0;
        const receiptAmount = parseFloat((invoice.total - depositAmount).toFixed(2));

        // Build description with breakdown
        const description =
          depositAmount > 0
            ? [
                `Final balance payment for Invoice ${invoice.invoiceNumber}`,
                ``,
                `Invoice total:             £${invoice.total.toFixed(2)}`,
                `Deposit already paid (${depositPct}%): -£${depositAmount.toFixed(2)}`,
                `Balance received:          £${receiptAmount.toFixed(2)}`,
              ].join("\n")
            : `Full payment for Invoice ${invoice.invoiceNumber}\n\nAmount received: £${invoice.total.toFixed(2)}`;

        receipt = await prisma.receipt.create({
          data: {
            receiptNumber,
            userId: invoice.userId,
            amount: receiptAmount,
            description,
            paymentMethod: "Bank Transfer",
            date: new Date(),
            careHomeName: invoice.careHomeName ?? null,
            careHomeAddress: invoice.careHomeAddress ?? null,
          },
        });
      }
    }

    return NextResponse.json({ 
      invoice: updatedInvoice, 
      receipt,
      message: status === "PAID" ? "Invoice marked as paid and receipt generated" : "Invoice status updated"
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 });
  }
}
