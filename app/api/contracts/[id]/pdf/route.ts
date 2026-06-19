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

  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { ContractPDF }    = await import("@/lib/contract-pdf");
  const React               = (await import("react")).default;

  const buffer = await renderToBuffer(
    React.createElement(ContractPDF, {
      id:              contract.id,
      title:           contract.title,
      clientName:      contract.clientName,
      clientAddress:   contract.clientAddress   ?? "",
      clientContact:   contract.clientContact   ?? "",
      clientEmail:     contract.clientEmail     ?? "",
      careHomeName:    contract.careHomeName    ?? "",
      careHomeAddress: contract.careHomeAddress ?? "",
      pricePerBox:     contract.pricePerBox,
      estimatedBoxes:  contract.estimatedBoxes  ?? null,
      totalCost:       contract.totalCost       ?? null,
      projectDuration: contract.projectDuration ?? "",
      depositPercent:  contract.depositPercent  ?? 30,
      scopeOfWorks:    contract.scopeOfWorks    ?? "",
      requirements:    contract.requirements    ?? "",
      paymentTerms:    contract.paymentTerms    ?? "",
      startDate:       contract.startDate ? contract.startDate.toISOString() : "",
      createdAt:       contract.createdAt.toISOString(),
      notes:           contract.notes ?? "",
    })
  );

  const nameSlug = contract.careHomeName
    ? `${contract.clientName}-${contract.careHomeName}`.replace(/\s+/g, "-")
    : contract.clientName.replace(/\s+/g, "-");
  const filename = `ScanVault-Contract-${nameSlug}-${contract.id.slice(-6)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
