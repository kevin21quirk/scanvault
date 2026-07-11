import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

interface InvoiceItemInput {
  description?: string;
  quantity?: unknown;
  rate?: unknown;
}

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
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      userId, invoiceNumber, vatRate, description, items, depositPercent,
      issueDate, dueDate, notes, careHomeId, careHomeName, careHomeAddress, billTo,
    } = body;

    if (invoiceNumber && invoiceNumber !== existing.invoiceNumber) {
      const dup = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      if (dup) {
        return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 });
      }
    }

    const lineItems = Array.isArray(items)
      ? (items as InvoiceItemInput[])
          .map((i) => ({
            description: String(i.description ?? "").trim(),
            quantity: Number(i.quantity) || 0,
            rate: Number(i.rate) || 0,
          }))
          .filter((i) => i.description.length > 0)
      : [];

    const subtotalAmount = lineItems.length
      ? lineItems.reduce((sum, i) => sum + i.quantity * i.rate, 0)
      : existing.subtotal;
    const vat = vatRate !== undefined ? parseFloat(vatRate) : existing.vatRate;
    const vatAmount = (subtotalAmount * vat) / 100;
    const total = subtotalAmount + vatAmount;
    const finalDescription = (description && String(description).trim())
      || lineItems.map((i) => i.description).join(", ")
      || existing.description;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(userId          !== undefined && { userId }),
        ...(invoiceNumber   !== undefined && { invoiceNumber }),
        subtotal: subtotalAmount,
        vatRate: vat,
        vatAmount,
        total,
        description: finalDescription,
        ...(lineItems.length > 0 && { items: lineItems }),
        ...(depositPercent  !== undefined && { depositPercent: depositPercent !== "" ? parseFloat(depositPercent) : 50 }),
        ...(careHomeId      !== undefined && { careHomeId: careHomeId || null }),
        ...(careHomeName    !== undefined && { careHomeName: careHomeName || null }),
        ...(careHomeAddress !== undefined && { careHomeAddress: careHomeAddress || null }),
        ...(billTo          !== undefined && { billTo: billTo === "CARE_HOME" ? "CARE_HOME" : "CLIENT" }),
        ...(issueDate       !== undefined && { issueDate: new Date(issueDate) }),
        ...(dueDate         !== undefined && { dueDate: new Date(dueDate) }),
        ...(notes           !== undefined && { notes: notes || null }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
