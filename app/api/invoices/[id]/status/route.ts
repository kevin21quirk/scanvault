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
      // Check if receipt already exists for this invoice
      const existingReceipt = await prisma.receipt.findFirst({
        where: {
          description: {
            contains: invoice.invoiceNumber,
          },
          userId: invoice.userId,
        },
      });

      if (!existingReceipt) {
        // Generate receipt number based on latest receipt
        const latestReceipt = await prisma.receipt.findFirst({
          orderBy: { createdAt: "desc" },
          select: { receiptNumber: true },
        });

        let nextReceiptNumber = 1500;
        if (latestReceipt && latestReceipt.receiptNumber) {
          const match = latestReceipt.receiptNumber.match(/REC-(\d+)/);
          if (match) {
            nextReceiptNumber = parseInt(match[1], 10) + 1;
          }
        }

        const receiptNumber = `REC-${String(nextReceiptNumber).padStart(5, '0')}`;

        // Create receipt
        receipt = await prisma.receipt.create({
          data: {
            receiptNumber,
            userId: invoice.userId,
            amount: invoice.total,
            description: `Payment for Invoice ${invoice.invoiceNumber}`,
            paymentMethod: "Bank Transfer",
            date: new Date(),
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
