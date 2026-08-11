import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import nodemailer from "nodemailer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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

    const toEmail = receipt.user.email;
    if (!toEmail) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const pdfBytes = generateReceiptPdf(receipt as any);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const clientName = receipt.user.name || receipt.user.companyName || toEmail;
    const fromAddress = `"ScanVault" <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Receipt ${receipt.receiptNumber} — ScanVault`,
      text: `Dear ${clientName},\n\nPlease find attached your receipt (${receipt.receiptNumber}) for £${receipt.amount.toFixed(2)}.\n\nThank you for your payment.\n\nScanVault\nkevin@scanvault.co.uk`,
      html: `<p>Dear ${clientName},</p>
<p>Please find attached your receipt <strong>${receipt.receiptNumber}</strong> for <strong>£${receipt.amount.toFixed(2)}</strong>.</p>
<p>Thank you for your payment.</p>
<p>ScanVault<br>kevin@scanvault.co.uk</p>`,
      attachments: [
        {
          filename: `Receipt-${receipt.receiptNumber}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true, sentTo: toEmail });
  } catch (error) {
    console.error("Error emailing receipt:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to send email", details: message }, { status: 500 });
  }
}
