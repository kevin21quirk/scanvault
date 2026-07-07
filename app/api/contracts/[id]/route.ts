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

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...(body.status          !== undefined && { status: body.status }),
      ...(body.userId          !== undefined && { userId: body.userId || null }),
      ...(body.title           !== undefined && { title: body.title }),
      ...(body.clientName      !== undefined && { clientName: body.clientName }),
      ...(body.clientAddress   !== undefined && { clientAddress: body.clientAddress }),
      ...(body.clientContact   !== undefined && { clientContact: body.clientContact }),
      ...(body.clientEmail     !== undefined && { clientEmail: body.clientEmail }),
      ...(body.careHomeName    !== undefined && { careHomeName: body.careHomeName || null }),
      ...(body.careHomeAddress !== undefined && { careHomeAddress: body.careHomeAddress || null }),
      ...(body.careHomeId      !== undefined && { careHomeId: body.careHomeId || null }),
      ...(body.pricePerBox     !== undefined && { pricePerBox: parseFloat(body.pricePerBox) }),
      ...(body.estimatedBoxes  !== undefined && { estimatedBoxes: body.estimatedBoxes ? parseInt(body.estimatedBoxes) : null }),
      ...(body.totalCost       !== undefined && { totalCost: body.totalCost ? parseFloat(body.totalCost) : null }),
      ...(body.projectDuration !== undefined && { projectDuration: body.projectDuration || null }),
      ...(body.depositPercent  !== undefined && { depositPercent: body.depositPercent ? parseFloat(body.depositPercent) : 30 }),
      ...(body.scopeOfWorks    !== undefined && { scopeOfWorks: body.scopeOfWorks || null }),
      ...(body.requirements    !== undefined && { requirements: body.requirements || null }),
      ...(body.paymentTerms    !== undefined && { paymentTerms: body.paymentTerms || null }),
      ...(body.startDate       !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.notes           !== undefined && { notes: body.notes }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(contract);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
