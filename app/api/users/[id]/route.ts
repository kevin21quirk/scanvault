import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const clientSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  companyName: true,
  contactName: true,
  phone: true,
  address: true,
  createdAt: true,
} as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // If changing email, ensure it isn't taken by another user
  if (body.email) {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Another user already has this email" }, { status: 400 });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.email       !== undefined && { email: body.email }),
      ...(body.name        !== undefined && { name: body.name || null }),
      ...(body.role        !== undefined && { role: body.role }),
      ...(body.companyName !== undefined && { companyName: body.companyName || null }),
      ...(body.contactName !== undefined && { contactName: body.contactName || null }),
      ...(body.phone       !== undefined && { phone: body.phone || null }),
      ...(body.address     !== undefined && { address: body.address || null }),
      ...(body.password && body.password.length > 0 && { password: await hash(body.password, 12) }),
    },
    select: clientSelect,
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Prevent deleting your own admin account
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
