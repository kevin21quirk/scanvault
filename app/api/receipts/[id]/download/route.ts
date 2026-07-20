import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import jsPDF from "jspdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true, companyName: true, address: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT" && receipt.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use care home if this is a deposit receipt, otherwise fall back to client details
    const recipientName    = (receipt as any).careHomeName    ?? receipt.user.companyName ?? receipt.user.name ?? receipt.user.email ?? "";
    const recipientAddress = (receipt as any).careHomeAddress ?? receipt.user.address ?? "";

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header ───────────────────────────────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const scanW = doc.getTextWidth("Scan");
    doc.text("Scan", 20, 20);
    doc.setTextColor(220, 38, 38);
    doc.text("Vault", 20 + scanW, 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Document Management Solutions", 20, 27);
    doc.text("Company Registration No: 17229057", 20, 32);
    doc.text("kevin@scanvault.co.uk  |  scanvault.co.uk", 20, 37);

    // ── "RECEIPT" title (top right) ──────────────────────────────────────────
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("RECEIPT", pageW - 20, 20, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Receipt No: ${receipt.receiptNumber}`, pageW - 20, 28, { align: "right" });
    doc.text(`Date: ${new Date(receipt.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, pageW - 20, 34, { align: "right" });

    // ── Separator ─────────────────────────────────────────────────────────────
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.8);
    doc.line(20, 44, pageW - 20, 44);

    // ── Received From ─────────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("RECEIVED FROM", 20, 54);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text(recipientName, 20, 61);
    if (recipientAddress) {
      const addrLines = doc.splitTextToSize(recipientAddress, 90);
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      doc.text(addrLines, 20, 67);
    }

    // ── Amount box ────────────────────────────────────────────────────────────
    const boxX = pageW - 80;
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(boxX, 50, 60, 24, 2, 2, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("AMOUNT RECEIVED", boxX + 30, 58, { align: "center" });

    doc.setFontSize(16);
    doc.text(`£${receipt.amount.toFixed(2)}`, boxX + 30, 68, { align: "center" });

    // ── Description box ───────────────────────────────────────────────────────
    const descY = 90;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, descY, pageW - 40, 28, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text("DESCRIPTION", 26, descY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    const descLines = doc.splitTextToSize(receipt.description, pageW - 56);
    doc.text(descLines, 26, descY + 16);

    // ── Payment method ────────────────────────────────────────────────────────
    const pmY = descY + 36;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Payment Method: `, 20, pmY);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(receipt.paymentMethod, 20 + doc.getTextWidth("Payment Method: "), pmY);

    // ── Footer separator ──────────────────────────────────────────────────────
    const footY = 260;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(20, footY, pageW - 20, footY);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text("ScanVault — This receipt confirms payment received as described above.", pageW / 2, footY + 6, { align: "center" });
    doc.text("ScanVault Ltd, 77 Church Street, Burton Latimer, Kettering, England, NN15 5LU", pageW / 2, footY + 11, { align: "center" });

    const pdfBytes = doc.output("arraybuffer");

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receipt.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
