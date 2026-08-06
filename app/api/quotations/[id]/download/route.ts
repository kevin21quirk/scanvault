import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            companyName: true,
            contactName: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && quotation.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = new jsPDF();

    // Company Header - "Scan" in black, "Vault" in red
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const scanText = "Scan";
    doc.text(scanText, 20, 20);
    const scanWidth = doc.getTextWidth(scanText);
    doc.setTextColor(220, 38, 38);
    doc.text("Vault", 20 + scanWidth, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Document Management Solutions", 20, 27);
    doc.text("Company Registration No: 17229057  |  VAT No: 523 0764 13", 20, 32);
    doc.text("kevin@scanvault.co.uk  |  scanvault.co.uk", 20, 37);

    // Quotation Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 140, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Quote Number: ${quotation.quoteNumber}`, 140, 30);
    doc.text(`Date: ${new Date(quotation.issueDate).toLocaleDateString("en-GB")}`, 140, 35);
    if (quotation.validUntil) {
      doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`, 140, 40);
    }
    doc.text(`Status: ${quotation.status}`, 140, 45);

    // Bill To
    const client = quotation.user;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("PREPARED FOR", 20, 55);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(quotation.clientName, 20, 61);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    let billY = 66;
    if (quotation.clientContact) { doc.text(quotation.clientContact, 20, billY); billY += 5; }
    if (quotation.clientAddress) {
      const addrLines = doc.splitTextToSize(quotation.clientAddress, 85);
      doc.text(addrLines, 20, billY);
      billY += addrLines.length * 5;
    }
    if (quotation.clientEmail || client?.email) { doc.text(quotation.clientEmail || client?.email || "", 20, billY); billY += 5; }

    // Site / Care Home
    if (quotation.careHomeName) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text("SITE / CARE HOME", 140, 55);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10.5);
      doc.text(quotation.careHomeName, 140, 61);

      if (quotation.careHomeAddress) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const siteAddrLines = doc.splitTextToSize(quotation.careHomeAddress, 50);
        doc.text(siteAddrLines, 140, 66);
      }
    }

    let y = Math.max(billY + 3, 80);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 8;

    // Title of quotation
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const titleLines = doc.splitTextToSize(quotation.title, 170);
    doc.text(titleLines, 20, y);
    y += titleLines.length * 6 + 4;

    // Scope of Works
    if (quotation.scopeOfWorks) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Scope of Works", 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const scopeLines = doc.splitTextToSize(quotation.scopeOfWorks, 170);
      for (const line of scopeLines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 4.6;
      }
      y += 4;
    }

    if (quotation.projectDuration) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Estimated Project Duration", 20, y);
      y += 5.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const durLines = doc.splitTextToSize(quotation.projectDuration, 170);
      doc.text(durLines, 20, y);
      y += durLines.length * 4.6 + 4;
    }

    if (quotation.requirements) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Requirements", 20, y);
      y += 5.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const reqLines = doc.splitTextToSize(quotation.requirements, 170);
      doc.text(reqLines, 20, y);
      y += reqLines.length * 4.6 + 6;
    }

    if (y > 250) { doc.addPage(); y = 20; }

    // Line Items Table
    const items = (quotation.items as any[]) || [
      { description: quotation.title, quantity: 1, unitPrice: quotation.subtotal, discountPercent: 0, amount: quotation.total },
    ];

    const tableData = items.map((item: any) => {
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discountPercent) || 0;
      const amount = Number(item.amount) || qty * unitPrice * (1 - discount / 100);
      return [
        String(item.description || ""),
        String(qty),
        `£${unitPrice.toFixed(2)}`,
        `${discount.toFixed(2)}%`,
        `£${amount.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Description", "Quantity", "Unit Price (£)", "Discount %", "Amount (£)"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontSize: 9.5,
        fontStyle: "bold",
        cellPadding: 3,
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [225, 225, 225],
        fontSize: 9.5,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      styles: {
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 78, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 18, halign: "right" },
        4: { cellWidth: 26, halign: "right" },
      },
      didParseCell: (data: any) => {
        if (data.section === "head") {
          if (data.column.index === 1) data.cell.styles.halign = "center";
          else if (data.column.index >= 2) data.cell.styles.halign = "right";
          else data.cell.styles.halign = "left";
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || y + 20;

    // Totals
    const labelX = 140;
    const valueX = 190;
    let ty = finalY + 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", labelX, ty);
    doc.text(`£${quotation.subtotal.toFixed(2)}`, valueX, ty, { align: "right" });

    if (quotation.discountTotal > 0) {
      ty += 6;
      doc.text("Discount", labelX, ty);
      doc.text(`-£${quotation.discountTotal.toFixed(2)}`, valueX, ty, { align: "right" });
    }

    const qVatRate = (quotation as any).vatRate ?? 0;
    const qVatAmount = (quotation as any).vatAmount ?? 0;
    if (qVatRate > 0) {
      ty += 6;
      doc.text(`VAT (${qVatRate}%)`, labelX, ty);
      doc.text(`£${qVatAmount.toFixed(2)}`, valueX, ty, { align: "right" });
    }

    ty += 3;
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.4);
    doc.line(labelX, ty, valueX, ty);

    ty += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(qVatRate > 0 ? "Total (inc. VAT)" : "Total (GBP)", 125, ty);
    doc.text(`£${quotation.total.toFixed(2)}`, valueX, ty, { align: "right" });

    // Deposit & payment terms
    const deposit = quotation.depositPercent ?? 30;
    const depositAmount = (quotation.total * deposit) / 100;
    const balanceAmount = quotation.total - depositAmount;
    const balancePct = Math.round((100 - deposit) * 100) / 100;

    let boxTop = ty + 10;
    if (boxTop + 45 > 275) { doc.addPage(); boxTop = 20; }
    const titleY = boxTop + 9;
    const row1Y = titleY + 7;
    const row2Y = row1Y + 6;
    const boxBottom = row2Y + 7;
    const boxHeight = boxBottom - boxTop;

    doc.setDrawColor(225, 225, 225);
    doc.setFillColor(248, 248, 248);
    doc.setLineWidth(0.2);
    doc.roundedRect(20, boxTop, 170, boxHeight, 2, 2, "FD");

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Deposit & Payment Terms", 26, titleY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Deposit (${deposit}%) required to secure the booking`, 26, row1Y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`£${depositAmount.toFixed(2)}`, 184, row1Y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Remaining balance (${balancePct}%) due upon completion of works`, 26, row2Y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`£${balanceAmount.toFixed(2)}`, 184, row2Y, { align: "right" });

    // Notes
    let noteY = boxBottom + 10;
    if (quotation.notes) {
      if (noteY > 265) { doc.addPage(); noteY = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Notes", 20, noteY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const splitNotes = doc.splitTextToSize(quotation.notes, 170);
      doc.text(splitNotes, 20, noteY + 5);
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("ScanVault  ·  Document Management Solutions", 105, 283, { align: "center" });
    doc.text("This quotation is valid for the period stated above and is subject to our standard terms & conditions.", 105, 288, { align: "center" });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quotation-${quotation.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating quotation PDF:", error);
    return NextResponse.json({ error: "Failed to generate quotation" }, { status: 500 });
  }
}
