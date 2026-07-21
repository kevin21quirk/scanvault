import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const receipts = await prisma.expenseReceipt.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(receipts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { vendor, amount, date, category, description, notes, fileUrl, fileName, mimeType } = body;

  if (!vendor || !amount || !date) {
    return NextResponse.json({ error: "Vendor, amount and date are required" }, { status: 400 });
  }

  const count = await prisma.expenseReceipt.count();
  const expenseNumber = `EXP-${String(count + 1).padStart(4, "0")}`;

  const receipt = await prisma.expenseReceipt.create({
    data: {
      expenseNumber,
      vendor,
      amount: parseFloat(amount),
      date: new Date(date),
      category: category || "OTHER",
      description: description || null,
      notes: notes || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      mimeType: mimeType || null,
    },
  });

  return NextResponse.json(receipt, { status: 201 });
}
