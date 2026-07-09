import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  const cert = await prisma.completionCertificate.findUnique({ where: { id } });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && cert.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { renderToBuffer }              = await import("@react-pdf/renderer");
  const { CompletionCertificatePDF }    = await import("@/lib/completion-certificate-pdf");
  const React                            = (await import("react")).default;

  const workItems = Array.isArray(cert.workItems)
    ? (cert.workItems as { description: string; quantity: string; unit: string }[])
    : [];

  const element = React.createElement(CompletionCertificatePDF, {
    certificateNumber: cert.certificateNumber,
    clientName:        cert.clientName,
    clientAddress:     cert.clientAddress    ?? "",
    clientContact:     cert.clientContact    ?? "",
    clientEmail:       cert.clientEmail      ?? "",
    careHomeName:      cert.careHomeName     ?? "",
    careHomeAddress:   cert.careHomeAddress  ?? "",
    worksDescription:  cert.worksDescription ?? "",
    workItems,
    completionDate:    cert.completionDate.toISOString(),
    assessorName:      cert.assessorName     ?? "Kevin Quirk",
    notes:             cert.notes            ?? "",
    createdAt:         cert.createdAt.toISOString(),
  }) as unknown as Parameters<typeof renderToBuffer>[0];

  const buffer   = await renderToBuffer(element);
  const nameSlug = (cert.careHomeName || cert.clientName).replace(/\s+/g, "-");
  const filename = `ScanVault-Completion-Certificate-${nameSlug}-${cert.id.slice(-6)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store, max-age=0",
    },
  });
}
