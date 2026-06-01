import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { respondedAt } = await req.json();

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: { respondedAt: respondedAt ? new Date(respondedAt) : new Date() },
  });

  return NextResponse.json(lead);
}
