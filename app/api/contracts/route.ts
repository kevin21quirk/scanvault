import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { title, clientName, clientAddress, clientContact, clientEmail, pricePerBox, estimatedBoxes, startDate, notes, userId } = body;

  if (!title || !clientName) {
    return NextResponse.json({ error: "Title and client name are required" }, { status: 400 });
  }

  const contract = await prisma.contract.create({
    data: {
      title,
      clientName,
      clientAddress: clientAddress || null,
      clientContact: clientContact || null,
      clientEmail:   clientEmail   || null,
      pricePerBox:   pricePerBox   ? parseFloat(pricePerBox) : 140,
      estimatedBoxes: estimatedBoxes ? parseInt(estimatedBoxes) : null,
      startDate:     startDate ? new Date(startDate) : null,
      notes:         notes || null,
      userId:        userId || null,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(contract, { status: 201 });
}
