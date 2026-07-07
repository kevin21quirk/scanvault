import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const assessment = await prisma.riskAssessment.update({
    where: { id },
    data: {
      ...(body.careHomeName    !== undefined && { careHomeName: body.careHomeName }),
      ...(body.careHomeAddress !== undefined && { careHomeAddress: body.careHomeAddress || null }),
      ...(body.careHomeId      !== undefined && { careHomeId: body.careHomeId || null }),
      ...(body.clientName      !== undefined && { clientName: body.clientName }),
      ...(body.clientAddress   !== undefined && { clientAddress: body.clientAddress || null }),
      ...(body.assessorName    !== undefined && { assessorName: body.assessorName || "Kevin Quirk" }),
      ...(body.workStartDate   !== undefined && { workStartDate: body.workStartDate ? new Date(body.workStartDate) : null }),
      ...(body.notes           !== undefined && { notes: body.notes || null }),
      ...(body.userId          !== undefined && { userId: body.userId || null }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(assessment);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.riskAssessment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
