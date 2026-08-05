import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface QuotationItemInput {
  description?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  discountPercent?: unknown;
}

function computeTotals(items: unknown, vatRateRaw?: unknown) {
  const lineItems = Array.isArray(items)
    ? (items as QuotationItemInput[])
        .map((i) => {
          const quantity = Number(i.quantity) || 0;
          const unitPrice = Number(i.unitPrice) || 0;
          const discountPercent = Number(i.discountPercent) || 0;
          const amount = quantity * unitPrice * (1 - discountPercent / 100);
          return {
            description: String(i.description ?? "").trim(),
            quantity,
            unitPrice,
            discountPercent,
            amount,
          };
        })
        .filter((i) => i.description.length > 0)
    : [];

  const subtotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountTotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.discountPercent / 100), 0);
  const netAfterDiscount = subtotal - discountTotal;
  const vat = vatRateRaw !== undefined && vatRateRaw !== "" ? parseFloat(String(vatRateRaw)) : 20.0;
  const vatAmount = parseFloat(((netAfterDiscount * vat) / 100).toFixed(2));
  const total = parseFloat((netAfterDiscount + vatAmount).toFixed(2));

  return { lineItems, subtotal, discountTotal, vatRate: vat, vatAmount, total };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  let itemsUpdate = {};
  if (body.items !== undefined) {
    const { lineItems, subtotal, discountTotal, vatRate, vatAmount, total } = computeTotals(body.items, body.vatRate);
    itemsUpdate = {
      items: lineItems.length ? lineItems : undefined,
      subtotal,
      discountTotal,
      vatRate,
      vatAmount,
      total,
    };
  } else if (body.vatRate !== undefined) {
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (existing) {
      const vat = parseFloat(String(body.vatRate)) || 0;
      const netAfterDiscount = existing.subtotal - existing.discountTotal;
      const vatAmount = parseFloat(((netAfterDiscount * vat) / 100).toFixed(2));
      const total = parseFloat((netAfterDiscount + vatAmount).toFixed(2));
      itemsUpdate = { vatRate: vat, vatAmount, total };
    }
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      ...(body.status          !== undefined && { status: body.status }),
      ...(body.userId          !== undefined && { userId: body.userId || null }),
      ...(body.title           !== undefined && { title: body.title }),
      ...(body.clientName      !== undefined && { clientName: body.clientName }),
      ...(body.clientAddress   !== undefined && { clientAddress: body.clientAddress || null }),
      ...(body.clientContact   !== undefined && { clientContact: body.clientContact || null }),
      ...(body.clientEmail     !== undefined && { clientEmail: body.clientEmail || null }),
      ...(body.careHomeName    !== undefined && { careHomeName: body.careHomeName || null }),
      ...(body.careHomeAddress !== undefined && { careHomeAddress: body.careHomeAddress || null }),
      ...(body.careHomeId      !== undefined && { careHomeId: body.careHomeId || null }),
      ...(body.scopeOfWorks    !== undefined && { scopeOfWorks: body.scopeOfWorks || null }),
      ...(body.requirements    !== undefined && { requirements: body.requirements || null }),
      ...(body.projectDuration !== undefined && { projectDuration: body.projectDuration || null }),
      ...(body.depositPercent  !== undefined && { depositPercent: body.depositPercent !== "" ? parseFloat(body.depositPercent) : 30 }),
      ...(body.validUntil      !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
      ...(body.notes           !== undefined && { notes: body.notes || null }),
      ...itemsUpdate,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(quotation);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
