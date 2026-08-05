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
      userId, invoiceNumber, vatRate, description, items, additionalItems, depositPercent,
      issueDate, dueDate, notes, careHomeId, careHomeName, careHomeAddress, billTo, showCompanyAddress, vatOnBalanceOnly,
    } = body;

    if (invoiceNumber && invoiceNumber !== existing.invoiceNumber) {
      const dup = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      if (dup) {
        return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 });
      }
    }

    const normaliseItems = (raw: unknown) =>
      Array.isArray(raw)
        ? (raw as InvoiceItemInput[])
            .map((i) => ({
              description: String(i.description ?? "").trim(),
              quantity: Number(i.quantity) || 0,
              rate: Number(i.rate) || 0,
            }))
            .filter((i) => i.description.length > 0)
        : [];

    const lineItems = normaliseItems(items);
    const addlItems = additionalItems !== undefined ? normaliseItems(additionalItems) : null;

    // Determine subtotal: recompute from whichever sets are provided, keep existing for the rest
    const existingAddlAmount = ((existing as any).additionalItems as any[] || [])
      .reduce((s: number, i: any) => s + Number(i.quantity || 0) * Number(i.rate || 0), 0);
    const baseAmount = lineItems.length
      ? lineItems.reduce((sum, i) => sum + i.quantity * i.rate, 0)
      : existing.subtotal - existingAddlAmount;
    const addlAmount = addlItems !== null
      ? addlItems.reduce((sum, i) => sum + i.quantity * i.rate, 0)
      : existingAddlAmount;
    const subtotalAmount = baseAmount + addlAmount;
    const vat = vatRate !== undefined ? parseFloat(vatRate) : existing.vatRate;
    const deposit = depositPercent !== undefined && depositPercent !== ""
      ? parseFloat(depositPercent)
      : existing.depositPercent ?? 50;
    const useBalanceOnly = vatOnBalanceOnly !== undefined ? vatOnBalanceOnly === true : (existing as any).vatOnBalanceOnly === true;
    const vatBase = useBalanceOnly ? subtotalAmount * (1 - deposit / 100) : subtotalAmount;
    const vatAmount = parseFloat(((vatBase * vat) / 100).toFixed(2));
    const total = parseFloat((subtotalAmount + vatAmount).toFixed(2));
    const finalDescription = lineItems.length > 0
      ? lineItems.map((i) => i.description).join(", ")
      : (description && String(description).trim()) || existing.description;

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
        ...(addlItems !== null && { additionalItems: addlItems.length ? addlItems : [] }),
        ...(depositPercent  !== undefined && { depositPercent: depositPercent !== "" ? parseFloat(depositPercent) : 50 }),
        ...(careHomeId      !== undefined && { careHomeId: careHomeId || null }),
        ...(careHomeName    !== undefined && { careHomeName: careHomeName || null }),
        ...(careHomeAddress !== undefined && { careHomeAddress: careHomeAddress || null }),
        ...(billTo          !== undefined && { billTo: billTo === "CARE_HOME" ? "CARE_HOME" : "CLIENT" }),
        ...(showCompanyAddress !== undefined && { showCompanyAddress: showCompanyAddress !== false }),
        ...(vatOnBalanceOnly   !== undefined && { vatOnBalanceOnly: vatOnBalanceOnly === true }),
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
