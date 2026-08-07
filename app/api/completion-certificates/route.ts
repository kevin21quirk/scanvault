import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

  const certs = await prisma.completionCertificate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } }, invoice: { select: { id: true, invoiceNumber: true } } },
  });

  return NextResponse.json(certs);
}

interface WorkItemInput {
  description?: string;
  quantity?: unknown;
  unit?: string;
}


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const {
    certificateNumber: bodyCertNumber, clientName, clientAddress, clientContact, clientEmail,
    careHomeName, careHomeAddress, careHomeId,
    worksDescription, workItems, completionDate, issuedDate,
    assessorName, notes, userId, invoiceId,
  } = body;

  let finalCertificateNumber = bodyCertNumber;
  let linkedInvoice = null;

  if (invoiceId) {
    linkedInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!linkedInvoice) {
      return NextResponse.json({ error: "Selected invoice not found" }, { status: 400 });
    }
    const match = linkedInvoice.invoiceNumber.match(/(\d+)$/);
    const seq = match ? match[1] : "0000";
    finalCertificateNumber = `CC-${seq}`;
  }

  if (!finalCertificateNumber || !clientName || !completionDate) {
    return NextResponse.json(
      { error: "Certificate number, client name, and completion date are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.completionCertificate.findUnique({ where: { certificateNumber: finalCertificateNumber } });
  if (existing) {
    return NextResponse.json({ error: "Certificate number already exists" }, { status: 400 });
  }

  const normItems = Array.isArray(workItems)
    ? (workItems as WorkItemInput[])
        .map((i) => ({
          description: String(i.description ?? "").trim(),
          quantity:    String(i.quantity ?? "").trim(),
          unit:        String(i.unit ?? "").trim(),
        }))
        .filter((i) => i.description.length > 0)
    : [];

  const cert = await prisma.completionCertificate.create({
    data: {
      certificateNumber: finalCertificateNumber,
      invoiceId:         invoiceId      || null,
      clientName,
      clientAddress:   clientAddress   || null,
      clientContact:   clientContact   || null,
      clientEmail:     clientEmail     || null,
      careHomeName:    careHomeName    || null,
      careHomeAddress: careHomeAddress || null,
      careHomeId:      careHomeId      || null,
      worksDescription: worksDescription || null,
      workItems:       normItems.length ? normItems : undefined,
      completionDate:  new Date(completionDate),
      issuedDate:      issuedDate ? new Date(issuedDate) : null,
      assessorName:    assessorName    || "Kevin Quirk",
      notes:           notes           || null,
      userId:          userId          || null,
    },
    include: { user: { select: { id: true, name: true, email: true } }, invoice: { select: { id: true, invoiceNumber: true } } },
  });

  return NextResponse.json(cert, { status: 201 });
}
