import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const quotations = await prisma.quotation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(quotations);
}

interface QuotationItemInput {
  description?: string;
  quantity?: unknown;
  unitPrice?: unknown;
  discountPercent?: unknown;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const {
    quoteNumber, title, clientName, clientAddress, clientContact, clientEmail,
    careHomeName, careHomeAddress, careHomeId,
    scopeOfWorks, requirements, projectDuration,
    items, depositPercent, validUntil, notes, userId, status,
  } = body;

  if (!quoteNumber || !clientName) {
    return NextResponse.json({ error: "Quote number and client name are required" }, { status: 400 });
  }

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
  const total = subtotal - discountTotal;

  const existing = await prisma.quotation.findUnique({ where: { quoteNumber } });
  if (existing) {
    return NextResponse.json({ error: "Quote number already exists" }, { status: 400 });
  }

  const quotation = await prisma.quotation.create({
    data: {
      quoteNumber,
      title: title || undefined,
      clientName,
      clientAddress: clientAddress || null,
      clientContact: clientContact || null,
      clientEmail: clientEmail || null,
      careHomeName: careHomeName || null,
      careHomeAddress: careHomeAddress || null,
      careHomeId: careHomeId || null,
      scopeOfWorks: scopeOfWorks || null,
      requirements: requirements || null,
      projectDuration: projectDuration || null,
      items: lineItems.length ? lineItems : undefined,
      subtotal,
      discountTotal,
      total,
      depositPercent: depositPercent !== undefined && depositPercent !== "" ? parseFloat(depositPercent) : 30,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes: notes || null,
      userId: userId || null,
      status: status || "DRAFT",
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(quotation, { status: 201 });
}
