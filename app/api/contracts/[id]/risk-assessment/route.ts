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

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && contract.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { renderToBuffer }    = await import("@react-pdf/renderer");
  const { RiskAssessmentPDF } = await import("@/lib/risk-assessment-pdf");
  const React                  = (await import("react")).default;

  const element = React.createElement(RiskAssessmentPDF, {
    id:              contract.id,
    clientName:      contract.clientName,
    clientAddress:   contract.clientAddress   ?? "",
    careHomeName:    contract.careHomeName    ?? "",
    careHomeAddress: contract.careHomeAddress ?? "",
    assessorName:    "Kevin Quirk",
    startDate:       contract.startDate ? contract.startDate.toISOString() : "",
    createdAt:       contract.createdAt.toISOString(),
  }) as unknown as Parameters<typeof renderToBuffer>[0];

  const buffer = await renderToBuffer(element);

  const nameSlug = (contract.careHomeName || contract.clientName).replace(/\s+/g, "-");
  const filename = `ScanVault-Risk-Assessment-${nameSlug}-${contract.id.slice(-6)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store, max-age=0",
    },
  });
}
