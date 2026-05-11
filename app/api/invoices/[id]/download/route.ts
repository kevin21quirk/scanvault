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
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Document Management Solutions", 20, 27);
    doc.text("VAT Registration No: GB123456789", 20, 32);
    doc.text("Company Registration No: 12345678", 20, 37);
    
    // Invoice Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 150, 20);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 150, 30);
    doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString("en-GB")}`, 150, 35);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`, 150, 40);
    doc.text(`Status: ${invoice.status}`, 150, 45);
    
    // Bill To
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.user.companyName || invoice.user.name || "Client", 20, 62);
    doc.text(invoice.user.email, 20, 67);
    
    // Line separator
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    // Items Table
    const items = invoice.items as any[] || [
      { description: invoice.description, quantity: 1, rate: invoice.subtotal }
    ];
    
    const tableData = items.map((item: any) => {
      const qty = item.quantity || 1;
      const rate = item.rate || invoice.subtotal;
      const amount = qty * rate;
      
      return [
        String(item.description || invoice.description),
        String(qty),
        `£${rate.toFixed(2)}`,
        `£${amount.toFixed(2)}`
      ];
    });
    
    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Quantity', 'Rate', 'Amount']],
      body: tableData,
      theme: 'plain',
      headStyles: { 
        fillColor: [220, 38, 38], 
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        lineWidth: 0,
        lineColor: [220, 38, 38]
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      didParseCell: (data: any) => {
        // Force header alignment to match body
        if (data.section === 'head') {
          if (data.column.index === 1) {
            data.cell.styles.halign = 'center';
          } else if (data.column.index === 2 || data.column.index === 3) {
            data.cell.styles.halign = 'right';
          } else {
            data.cell.styles.halign = 'left';
          }
        }
      }
    });
    
    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    
    // Totals
    const totalsX = 130;
    let currentY = finalY + 10;
    
    doc.setFontSize(10);
    doc.text("Subtotal:", totalsX, currentY);
    doc.text(`£${invoice.subtotal.toFixed(2)}`, 185, currentY, { align: "right" });
    
    currentY += 6;
    doc.text(`VAT (${invoice.vatRate}%):`, totalsX, currentY);
    doc.text(`£${invoice.vatAmount.toFixed(2)}`, 185, currentY, { align: "right" });
    
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", totalsX, currentY);
    doc.text(`£${invoice.total.toFixed(2)}`, 185, currentY, { align: "right" });
    
    // Notes
    if (invoice.notes) {
      currentY += 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Notes:", 20, currentY);
      
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, currentY + 5);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    doc.text("Payment terms: Net 30 days", 105, 285, { align: "center" });
    
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
