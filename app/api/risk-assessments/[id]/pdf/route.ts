import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;

  const ra = await prisma.riskAssessment.findUnique({ where: { id } });
  if (!ra) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && ra.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { renderToBuffer }    = await import("@react-pdf/renderer");
  const { RiskAssessmentPDF } = await import("@/lib/risk-assessment-pdf");
  const React                  = (await import("react")).default;

  const element = React.createElement(RiskAssessmentPDF, {
    id:              ra.id,
    clientName:      ra.clientName,
    clientAddress:   ra.clientAddress   ?? "",
    careHomeName:    ra.careHomeName    ?? "",
    careHomeAddress: ra.careHomeAddress ?? "",
    assessorName:    ra.assessorName    ?? "Kevin Quirk",
    startDate:       ra.workStartDate ? ra.workStartDate.toISOString() : "",
    createdAt:       ra.createdAt.toISOString(),
  }) as unknown as Parameters<typeof renderToBuffer>[0];

  const buffer = await renderToBuffer(element);

  const nameSlug = (ra.careHomeName || ra.clientName).replace(/\s+/g, "-");
  const filename = `ScanVault-Risk-Assessment-${nameSlug}-${ra.id.slice(-6)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store, max-age=0",
    },
  });
}
