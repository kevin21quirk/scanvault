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

    const invoice = await prisma.invoice.findUnique({
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

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check authorization
    if (session.user.role !== "ADMIN" && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate PDF
    const doc = new jsPDF();
    
    // Company Header - "Scan" in black, "Vault" in red
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black
    const scanText = "Scan";
    doc.text(scanText, 20, 20);
    
    // Calculate width of "Scan" to position "Vault" right next to it
    const scanWidth = doc.getTextWidth(scanText);
    doc.setTextColor(220, 38, 38); // Red
    doc.text("Vault", 20 + scanWidth, 20);
    
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Document Management Solutions", 20, 27);
    doc.text("77 Church Street, Burton Latimer, Kettering, England, NN15 5LU", 20, 32);
    doc.text("Company Registration No: 17229057", 20, 37);
    doc.text("kevin@scanvault.co.uk  |  scanvault.co.uk", 20, 42);
    
    // Invoice Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 150, 20);
    
    // Invoice Details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 150, 30);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}`, 150, 35);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`, 150, 40);
    doc.text(`Status: ${invoice.status}`, 150, 45);
    
    // Bill To — respects billTo field ("CLIENT" or "CARE_HOME")
    const client = invoice.user;
    const billToHome = invoice.billTo === "CARE_HOME" && !!invoice.careHomeName;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("BILL TO", 20, 55);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    let billY = 66;

    if (billToHome) {
      // Primary billing entity is the care home
      doc.text(invoice.careHomeName!, 20, 61);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      if (invoice.careHomeAddress) {
        const addrLines = doc.splitTextToSize(invoice.careHomeAddress, 85);
        doc.text(addrLines, 20, billY);
        billY += addrLines.length * 5;
      }

      // Show client as account holder on the right
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text("CLIENT ACCOUNT", 150, 55);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(client.companyName || client.name || "Client", 150, 61);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      let rightY = 66;
      if (client.contactName) { doc.text(client.contactName, 150, rightY); rightY += 5; }
      doc.text(client.email, 150, rightY);
    } else {
      // Primary billing entity is the client
      doc.text(client.companyName || client.name || "Client", 20, 61);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      if (client.contactName) { doc.text(client.contactName, 20, billY); billY += 5; }
      if (client.address) {
        const addrLines = doc.splitTextToSize(client.address, 85);
        doc.text(addrLines, 20, billY);
        billY += addrLines.length * 5;
      }
      doc.text(client.email, 20, billY); billY += 5;
      if (client.phone) { doc.text(client.phone, 20, billY); billY += 5; }

      // Site / Care Home on the right
      if (invoice.careHomeName) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 120, 120);
        doc.text("SITE / CARE HOME", 150, 55);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold");
        doc.text(invoice.careHomeName, 150, 61);
        if (invoice.careHomeAddress) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const siteAddrLines = doc.splitTextToSize(invoice.careHomeAddress, 45);
          doc.text(siteAddrLines, 150, 66);
        }
      }
    }

    // Line separator
    const sepY = Math.max(billY + 3, 80);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(20, sepY, 190, sepY);

    // Items Table
    const items = (invoice.items as any[]) || [
      { description: invoice.description, quantity: 1, rate: invoice.subtotal },
    ];

    const tableData = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.rate) || invoice.subtotal;
      const amount = qty * rate;
      return [
        String(item.description || invoice.description),
        String(qty),
        `£${rate.toFixed(2)}`,
        `£${amount.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: sepY + 6,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
        cellPadding: 3,
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [225, 225, 225],
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 95, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
      },
      didParseCell: (data: any) => {
        if (data.section === "head") {
          if (data.column.index === 1) data.cell.styles.halign = "center";
          else if (data.column.index >= 2) data.cell.styles.halign = "right";
          else data.cell.styles.halign = "left";
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;

    // Totals
    const labelX = 140;
    const valueX = 190;
    let y = finalY + 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", labelX, y);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, valueX, y, { align: "right" });

    if (invoice.vatRate > 0) {
      y += 6;
      doc.text(`VAT (${invoice.vatRate}%)`, labelX, y);
      doc.text(`£${invoice.vatAmount.toFixed(2)}`, valueX, y, { align: "right" });
    }

    y += 3;
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.4);
    doc.line(labelX, y, valueX, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Due", labelX, y);
    doc.text(`£${invoice.total.toFixed(2)}`, valueX, y, { align: "right" });

    // Payment schedule
    const deposit = invoice.depositPercent ?? 50;
    const depositAmount = (invoice.total * deposit) / 100;
    const balanceAmount = invoice.total - depositAmount;
    const balancePct = Math.round((100 - deposit) * 100) / 100;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const balText = doc.splitTextToSize(
      `Remaining balance (${balancePct}%) due no later than 30 days (net) following completion of the works`,
      150
    );

    // Compute row baselines before drawing so the box height matches the content exactly
    const boxTop = y + 14;
    const titleY = boxTop + 9;
    const row1Y = titleY + 7;
    const row2Y = row1Y + 6;
    const lastLineY = row2Y + (balText.length - 1) * 5;
    const boxBottom = lastLineY + 7;
    const boxHeight = boxBottom - boxTop;

    doc.setDrawColor(225, 225, 225);
    doc.setFillColor(248, 248, 248);
    doc.setLineWidth(0.2);
    doc.roundedRect(20, boxTop, 170, boxHeight, 2, 2, "FD");

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Payment Schedule", 26, titleY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Deposit (${deposit}%) due upon acceptance of this invoice`, 26, row1Y);
    doc.setFont("helvetica", "bold");
    doc.text(`£${depositAmount.toFixed(2)}`, 184, row1Y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(balText, 26, row2Y);
    doc.setFont("helvetica", "bold");
    doc.text(`£${balanceAmount.toFixed(2)}`, 184, row2Y, { align: "right" });

    // Bank Payment Details
    let bankBoxTop = boxBottom + 8;
    if (bankBoxTop + 45 > 270) {
      doc.addPage();
      bankBoxTop = 20;
    }
    const bankTitleY = bankBoxTop + 9;
    const bankRow1Y = bankTitleY + 8;
    const bankRow2Y = bankRow1Y + 6;
    const bankRow3Y = bankRow2Y + 6;
    const bankRow4Y = bankRow3Y + 6;
    const bankBoxBottom = bankRow4Y + 7;
    const bankBoxHeight = bankBoxBottom - bankBoxTop;

    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, bankBoxTop, 170, bankBoxHeight, 2, 2, "FD");
    doc.setFillColor(220, 38, 38);
    doc.rect(20, bankBoxTop, 2.5, bankBoxHeight, "F");

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Bank Payment Details", 28, bankTitleY);

    const bankLabelX = 28;
    const bankValueX = 80;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Account Name", bankLabelX, bankRow1Y);
    doc.setFont("helvetica", "bold");
    doc.text("SCANVAULT LIMITED", bankValueX, bankRow1Y);

    doc.setFont("helvetica", "normal");
    doc.text("Account Number", bankLabelX, bankRow2Y);
    doc.setFont("helvetica", "bold");
    doc.text("74091072", bankValueX, bankRow2Y);

    doc.setFont("helvetica", "normal");
    doc.text("Sort Code", bankLabelX, bankRow3Y);
    doc.setFont("helvetica", "bold");
    doc.text("23-01-20", bankValueX, bankRow3Y);

    doc.setFont("helvetica", "normal");
    doc.text("Payment Reference", bankLabelX, bankRow4Y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(invoice.invoiceNumber, bankValueX, bankRow4Y);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Please use the payment reference above so we can match your payment to this invoice.", bankLabelX, bankBoxBottom - 2.5);
    doc.setTextColor(0, 0, 0);

    // Notes
    let noteY = bankBoxBottom + 10;
    if (invoice.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Notes", 20, noteY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, noteY + 5);
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("ScanVault  ·  Document Management Solutions", 105, 283, { align: "center" });
    doc.text("Thank you for your business. Please quote the invoice number with any payment.", 105, 288, { align: "center" });
    
    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");
    
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
