import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface WorkItemInput {
  description?: string;
  quantity?: unknown;
  unit?: string;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const normItems = Array.isArray(body.workItems)
    ? (body.workItems as WorkItemInput[])
        .map((i) => ({
          description: String(i.description ?? "").trim(),
          quantity:    Number(i.quantity) || 0,
          unit:        String(i.unit ?? "").trim(),
        }))
        .filter((i) => i.description.length > 0)
    : undefined;

  const cert = await prisma.completionCertificate.update({
    where: { id },
    data: {
      ...(body.certificateNumber !== undefined && { certificateNumber: body.certificateNumber }),
      ...(body.clientName        !== undefined && { clientName: body.clientName }),
      ...(body.clientAddress     !== undefined && { clientAddress: body.clientAddress || null }),
      ...(body.clientContact     !== undefined && { clientContact: body.clientContact || null }),
      ...(body.clientEmail       !== undefined && { clientEmail: body.clientEmail || null }),
      ...(body.careHomeName      !== undefined && { careHomeName: body.careHomeName || null }),
      ...(body.careHomeAddress   !== undefined && { careHomeAddress: body.careHomeAddress || null }),
      ...(body.careHomeId        !== undefined && { careHomeId: body.careHomeId || null }),
      ...(body.worksDescription  !== undefined && { worksDescription: body.worksDescription || null }),
      ...(normItems              !== undefined && { workItems: normItems }),
      ...(body.completionDate    !== undefined && { completionDate: new Date(body.completionDate) }),
      ...(body.assessorName      !== undefined && { assessorName: body.assessorName || "Kevin Quirk" }),
      ...(body.notes             !== undefined && { notes: body.notes || null }),
      ...(body.userId            !== undefined && { userId: body.userId || null }),
      ...(body.status            !== undefined && { status: body.status }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(cert);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.completionCertificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
