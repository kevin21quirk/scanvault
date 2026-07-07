import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const careHomes = await prisma.careHome.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(careHomes);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, name, address, notes } = body;

  if (!userId || !name) {
    return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
  }

  const careHome = await prisma.careHome.create({
    data: { userId, name, address: address || null, notes: notes || null },
  });

  return NextResponse.json(careHome);
}
