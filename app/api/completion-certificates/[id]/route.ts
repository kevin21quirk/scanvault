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

  const current = await prisma.completionCertificate.findUnique({
    where: { id },
    select: { certificateNumber: true, invoiceId: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const normItems = Array.isArray(body.workItems)
    ? (body.workItems as WorkItemInput[])
        .map((i) => ({
          description: String(i.description ?? "").trim(),
          quantity:    String(i.quantity ?? "").trim(),
          unit:        String(i.unit ?? "").trim(),
        }))
        .filter((i) => i.description.length > 0)
    : undefined;

  let updateData: any = {
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
    ...(body.issuedDate        !== undefined && { issuedDate: body.issuedDate ? new Date(body.issuedDate) : null }),
    ...(body.assessorName      !== undefined && { assessorName: body.assessorName || "Kevin Quirk" }),
    ...(body.notes             !== undefined && { notes: body.notes || null }),
    ...(body.userId            !== undefined && { userId: body.userId || null }),
    ...(body.status            !== undefined && { status: body.status }),
  };

  if (body.invoiceId !== undefined) {
    const nextInvoiceId = body.invoiceId || null;
    if (nextInvoiceId !== current.invoiceId) {
      if (nextInvoiceId) {
        const inv = await prisma.invoice.findUnique({ where: { id: nextInvoiceId } });
        if (!inv) return NextResponse.json({ error: "Selected invoice not found" }, { status: 400 });
        const match = inv.invoiceNumber.match(/(\d+)$/);
        const seq = match ? match[1] : "0000";
        const nextCertNumber = `CC-${seq}`;
        if (nextCertNumber !== current.certificateNumber) {
          const existing = await prisma.completionCertificate.findUnique({ where: { certificateNumber: nextCertNumber } });
          if (existing && existing.id !== id) {
            return NextResponse.json({ error: "Certificate number already exists" }, { status: 400 });
          }
          updateData.certificateNumber = nextCertNumber;
        }
        updateData.invoiceId = nextInvoiceId;
      } else {
        updateData.invoiceId = null;
      }
    }
  }

  const cert = await prisma.completionCertificate.update({
    where: { id },
    data: updateData,
    include: { user: { select: { id: true, name: true, email: true } }, invoice: { select: { id: true, invoiceNumber: true } } },
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
