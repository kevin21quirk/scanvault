import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await prisma.bankReconciliation.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, transactions: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { filename, transactions } = body;
  if (!filename || !transactions) {
    return NextResponse.json({ error: "filename and transactions are required" }, { status: 400 });
  }
  const rec = await prisma.bankReconciliation.create({
    data: { filename, transactions },
  });
  return NextResponse.json(rec, { status: 201 });
}
