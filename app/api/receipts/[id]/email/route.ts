import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import nodemailer from "nodemailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Optional override: { toEmail: "test@example.com" } for test sends
    let overrideEmail: string | undefined;
    try {
      const body = await request.json();
      if (body?.toEmail) overrideEmail = body.toEmail;
    } catch { /* no body is fine */ }

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

    const clientEmail = receipt.user.email;
    if (!clientEmail && !overrideEmail) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const isTest = !!overrideEmail;
    const toEmail = overrideEmail || clientEmail!;

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

    const clientName = receipt.user.name || receipt.user.companyName || clientEmail || toEmail;
    const fromAddress = `"ScanVault" <${process.env.SMTP_USER}>`;
    const subject = isTest
      ? `[TEST] Receipt ${receipt.receiptNumber} — ScanVault (client: ${clientEmail})`
      : `Receipt ${receipt.receiptNumber} — ScanVault`;

    const testBanner = isTest
      ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:10px 16px;margin-bottom:16px;border-radius:4px;font-size:13px;color:#92400e;">
<strong>TEST EMAIL</strong> — This is a preview of the email that would be sent to <strong>${clientEmail}</strong>. Do not reply to this message.
</div>`
      : "";

    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: isTest
        ? `[TEST EMAIL — would be sent to ${clientEmail}]\n\nDear ${clientName},\n\nPlease find attached your receipt (${receipt.receiptNumber}) for £${receipt.amount.toFixed(2)}.\n\nThank you for your payment.\n\nScanVault\nkevin@scanvault.co.uk`
        : `Dear ${clientName},\n\nPlease find attached your receipt (${receipt.receiptNumber}) for £${receipt.amount.toFixed(2)}.\n\nThank you for your payment.\n\nScanVault\nkevin@scanvault.co.uk`,
      html: `${testBanner}<p>Dear ${clientName},</p>
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

    return NextResponse.json({ success: true, sentTo: toEmail, isTest });
  } catch (error) {
    console.error("Error emailing receipt:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to send email", details: message }, { status: 500 });
  }
}
