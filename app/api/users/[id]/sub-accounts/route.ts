import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const subSelect = {
  id: true,
  email: true,
  name: true,
  parentUserId: true,
  mustChangePassword: true,
  createdAt: true,
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const subs = await prisma.user.findMany({
    where: { parentUserId: id },
    select: subSelect,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(subs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { email, name, password } = await req.json();

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  // Verify parent exists
  const parent = await prisma.user.findUnique({ where: { id }, select: { id: true, companyName: true } });
  if (!parent) return NextResponse.json({ error: "Parent client not found" }, { status: 404 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });

  const sub = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: await hash(password, 12),
      role: "CLIENT",
      companyName: parent.companyName,
      parentUserId: id,
      mustChangePassword: true,
    },
    select: subSelect,
  });

  return NextResponse.json(sub, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { subId } = await req.json();
  if (!subId) return NextResponse.json({ error: "subId is required" }, { status: 400 });

  const sub = await prisma.user.findUnique({ where: { id: subId } });
  if (!sub || sub.parentUserId !== id) {
    return NextResponse.json({ error: "Sub-account not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: subId } });
  return NextResponse.json({ success: true });
}
